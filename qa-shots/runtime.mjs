/**
 * Runtime check for the production server (dev-only QA tooling).
 *
 *   node qa-shots/runtime.mjs
 *
 * Collects console errors/warnings, page exceptions and failed requests for
 * every route, then asserts the content invariants the layout work must not
 * have broken: exactly one portrait, one capability map, and working contact
 * links.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const ROUTES = [
  "/",
  "/work",
  "/work/ariv-agentic-revenue-recovery",
  "/work/info-i-veritrust-agent",
  "/work/sodhanegpt-crime-intelligence-platform",
  "/work/hazard-det-road-intelligence-system",
  "/engineering",
  "/proof",
  "/achievements",
  "/lab",
  "/about",
  "/contact",
];

const W = Number(process.argv[2] || 1440);
const H = Number(process.argv[3] || 900);

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 42000 + Math.floor(Math.random() * 9000);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-rt-${process.pid}`,
    "--no-first-run",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function cdpUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("chrome did not start");
}

const ws = new WebSocket(await cdpUrl());
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});
let id = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(new Error(JSON.stringify(m.error)));
    else p.resolve(m.result);
    return;
  }
  for (const fn of listeners) fn(m);
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, { resolve, reject });
    ws.send(JSON.stringify({ id: i, method, params, sessionId }));
  });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Log.enable", {}, sessionId);
await send("Network.enable", {}, sessionId);
await send("Emulation.setDeviceMetricsOverride", {
  width: W,
  height: H,
  deviceScaleFactor: 1,
  mobile: W < 500,
  screenWidth: W,
  screenHeight: H,
}, sessionId);

let bucket = [];
listeners.push((m) => {
  if (m.sessionId && m.sessionId !== sessionId) return;
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) {
    bucket.push({
      kind: `console.${m.params.type}`,
      text: (m.params.args || []).map((a) => a.value ?? a.description ?? a.type).join(" "),
    });
  }
  if (m.method === "Runtime.exceptionThrown") {
    const d = m.params.exceptionDetails;
    bucket.push({ kind: "exception", text: d.exception?.description || d.text });
  }
  if (m.method === "Log.entryAdded" && ["error", "warning"].includes(m.params.entry.level)) {
    bucket.push({ kind: `log.${m.params.entry.level}`, text: m.params.entry.text });
  }
  if (m.method === "Network.loadingFailed" && !m.params.canceled) {
    bucket.push({ kind: "request.failed", text: m.params.errorText });
  }
  if (m.method === "Network.responseReceived" && m.params.response.status >= 400) {
    bucket.push({ kind: `http.${m.params.response.status}`, text: m.params.response.url });
  }
});

const probe = `JSON.stringify((() => {
  const srcOf = (i) => i.currentSrc || i.src;
  const portraitRe = /praveen\\.jpeg/;
  const all = [...document.querySelectorAll('img')];
  const portraits = all.filter((i) => portraitRe.test(srcOf(i)));
  const hero = document.querySelector('section#top.hero, section.hero');
  const heroPortraits = hero ? [...hero.querySelectorAll('img')].filter((i) => portraitRe.test(srcOf(i))) : [];
  const visible = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      if (getComputedStyle(n).display === 'none' || getComputedStyle(n).visibility === 'hidden') return false;
    }
    return true;
  };
  const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  const cursor = getComputedStyle(document.body).cursor;
  let pointerFx = false;
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.cursor === 'pointer' && el.closest('a,button,[role="button"]') === null) {
      pointerFx = true;
      break;
    }
  }
  return {
    title: document.title,
    heroPortraitCount: heroPortraits.length,
    heroPortraitsVisible: heroPortraits.filter(visible).length,
    pagePortraitCount: portraits.length,
    mapCount: document.querySelectorAll('.map, .sysmap, figure.sysmap').length,
    cursor,
    pointerFx,
    mailto: links.filter((h) => h.startsWith('mailto:')),
    wa: links.filter((h) => h.startsWith('https://wa.me/')),
    ig: links.filter((h) => h.includes('instagram.com')),
    emptyLinks: links.filter((h) => !h || h === '#').length,
  };
})())`;

let failures = 0;
console.log(`\n### runtime check @ ${W}x${H}\n`);

for (const route of ROUTES) {
  bucket = [];
  await send("Page.navigate", { url: `http://localhost:3000${route}` }, sessionId);
  await sleep(2600);
  const { result, exceptionDetails } = await send(
    "Runtime.evaluate",
    { expression: probe, returnByValue: true },
    sessionId,
  );
  if (exceptionDetails) {
    console.log(`${route}  PROBE ERROR ${exceptionDetails.text}`);
    failures++;
    continue;
  }
  const d = JSON.parse(result.value);

  const problems = [];
  if (route === "/") {
    if (d.heroPortraitCount !== 1) problems.push(`hero portrait count ${d.heroPortraitCount} (expected 1)`);
    if (d.heroPortraitsVisible !== 1) problems.push(`hero portraits visible ${d.heroPortraitsVisible} (expected 1)`);
    if (d.mapCount !== 1) problems.push(`map count ${d.mapCount} (expected 1)`);
  }
  if (d.cursor !== "auto" && d.cursor !== "default") problems.push(`body cursor ${d.cursor}`);
  if (d.pointerFx) problems.push("cursor:pointer on a non-interactive element");
  if (!d.mailto.some((h) => h === "mailto:praveensrinivasan05@gmail.com?subject=Portfolio%20Inquiry")) {
    problems.push(`mailto mismatch: ${JSON.stringify(d.mailto)}`);
  }
  if (!d.wa.includes("https://wa.me/917358085171")) problems.push(`wa.me missing: ${JSON.stringify(d.wa)}`);
  if (!d.ig.includes("https://www.instagram.com/praveen.g2t/")) {
    problems.push(`instagram missing: ${JSON.stringify(d.ig)}`);
  }
  for (const b of bucket) {
    if (b.kind === "log.warning") continue;
    problems.push(`${b.kind}: ${String(b.text).slice(0, 150)}`);
  }

  if (problems.length) {
    failures++;
    console.log(`FAIL ${route}`);
    for (const p of problems) console.log(`       - ${p}`);
  } else {
    const warn = bucket.filter((b) => b.kind === "log.warning").length;
    console.log(`ok   ${route}${warn ? `  (${warn} warning(s))` : ""}`);
  }
}

console.log(`\n${failures === 0 ? "ALL ROUTES CLEAN" : `${failures} route(s) with problems`}`);

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}
process.exit(failures === 0 ? 0 : 1);