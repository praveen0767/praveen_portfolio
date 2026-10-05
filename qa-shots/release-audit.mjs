/**
 * Release-gate DOM audit (dev-only QA tooling).
 *
 *   node qa-shots/release-audit.mjs
 *
 * Checks, on the production server, for every route:
 *   - every rendered anchor: no `href="#"`, no empty href, no localhost
 *   - the exact contact/social/resume hrefs the brief requires
 *   - external links carry target="_blank" + rel="noopener noreferrer"
 *   - heading outline (exactly one h1, no skipped levels)
 *   - every <img> has an alt attribute; icon-only controls have a name
 *   - no duplicate ids, no dangling aria-controls / aria-labelledby
 *   - identity copy (Forward Deployed Engineer) present in crawlable HTML
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const ROUTES = [
  "/",
  "/work",
  "/work/ariv-agentic-revenue-recovery",
  "/engineering",
  "/proof",
  "/achievements",
  "/lab",
  "/about",
  "/contact",
  "/definitely-not-a-page",
];

const EXPECTED_HREFS = {
  mailto: "mailto:praveensrinivasan05@gmail.com?subject=Portfolio%20Inquiry",
  whatsapp: "https://wa.me/917358085171",
  instagram: "https://www.instagram.com/praveen.g2t/",
  github: "https://github.com/praveen0767/",
  linkedin: "https://www.linkedin.com/in/praveen-kumar-srinivasan-9b6737280/",
  arivRepo: "https://github.com/praveen0767/ARIV",
};

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 51000 + Math.floor(Math.random() * 2000);
const BASE = process.env.QA_BASE || "http://localhost:3000";

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-release-${process.pid}`,
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
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
  screenWidth: 1440,
  screenHeight: 900,
}, sessionId);

const probe = `JSON.stringify((() => {
  /* NB: this probe is a template literal, so no backslash escapes survive into
     the evaluated source. Everything below is written escape-free on purpose. */
  const words = (s) => (s || '').split(' ').filter(Boolean).join(' ');
  const anchors = [...document.querySelectorAll('a[href]')].map((a) => ({
    href: a.getAttribute('href'),
    text: words(a.innerText || a.textContent).slice(0, 40),
    blank: a.target === '_blank',
    rel: a.rel || '',
  }));
  const imgs = [...document.querySelectorAll('img')];
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1]));
  const levels = headings.filter((h, i) => i === 0 || h === headings[i - 1] + 1 || h <= headings[i - 1]);
  const iconOnly = [...document.querySelectorAll('a,button')].filter((el) => {
    const hasText = (el.innerText || '').trim().length > 0;
    const named = el.getAttribute('aria-label') || el.getAttribute('title') || el.querySelector('.visually-hidden');
    return !hasText && !named;
  }).map((el) => (el.getAttribute('href') || el.className || el.tagName).slice(0, 60));
  const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
  const dupes = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
  const aria = [...document.querySelectorAll('[aria-controls],[aria-labelledby]')].flatMap((el) =>
    (el.getAttribute('aria-controls') || '').split(' ')
      .concat((el.getAttribute('aria-labelledby') || '').split(' ')),
  ).filter(Boolean);
  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || '',
    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
    ogUrl: document.querySelector('meta[property="og:url"]')?.content || '',
    jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
    anchors,
    imgCount: imgs.length,
    imgsWithoutAlt: imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.currentSrc || i.src),
    h1Count: headings.filter((h) => h === 1).length,
    headingSkip: headings.some((h, i) => i > 0 && h > headings[i - 1] + 1),
    levels: levels.length === headings.length,
    iconOnly,
    dupes,
    danglingAria: aria.filter((a) => a && !ids.includes(a)),
    bodyText: document.body.innerText,
    lang: document.documentElement.lang,
  };
})())`;

let failures = 0;
const found = new Set();
console.log("\n### release DOM audit\n");

for (const route of ROUTES) {
  const errors = [];
  const onEvent = (m) => {
    if (m.sessionId && m.sessionId !== sessionId) return;
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      errors.push((m.params.args || []).map((a) => a.value ?? a.description ?? "").join(" "));
    }
    if (m.method === "Runtime.exceptionThrown") {
      errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    }
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
      errors.push(m.params.entry.text);
    }
  };
  listeners.push(onEvent);

  const nav = await send("Page.navigate", { url: `${BASE}${route}` }, sessionId);
  await sleep(2400);
  const { result, exceptionDetails } = await send(
    "Runtime.evaluate",
    { expression: probe, returnByValue: true },
    sessionId,
  );
  const idx = listeners.indexOf(onEvent);
  if (idx >= 0) listeners.splice(idx, 1);

  const problems = [];
  if (nav.frameId === undefined) problems.push("navigation failed");
  if (exceptionDetails) problems.push(`probe error ${exceptionDetails.text}`);

  if (!exceptionDetails) {
    const d = JSON.parse(result.value);

    for (const a of d.anchors) {
      if (a.href === "#" || a.href === "" || a.href === null) problems.push(`dead anchor "${a.text}"`);
      if (a.href.includes('localhost') || a.href.includes('127.0.0.1')) {
        problems.push(`localhost link: ${a.href}`);
      }
      const external = a.href.startsWith('http://') || a.href.startsWith('https://');
      if (external) {
        if (!a.blank) problems.push(`external without target=_blank: ${a.href}`);
        if (!a.rel.includes('noopener') || !a.rel.includes('noreferrer')) {
          problems.push(`external without noopener/noreferrer: ${a.href}`);
        }
      }
    }

    const hrefs = d.anchors.map((a) => a.href);
    if (route === "/") {
      for (const [key, value] of Object.entries(EXPECTED_HREFS)) {
        if (hrefs.includes(value)) found.add(key);
      }
      if (hrefs.some((h) => h.startsWith("mailto:") && h !== EXPECTED_HREFS.mailto)) {
        problems.push(`unexpected mailto: ${hrefs.find((h) => h.startsWith("mailto:"))}`);
      }
      if (!hrefs.includes("/Praveen_Resume.pdf")) problems.push("resume link missing on home");
      if (!hrefs.some((h) => h.startsWith("/work/ariv-agentic-revenue-recovery"))) {
        problems.push("ARIV link missing on home");
      }
      if (!/Forward Deployed Engineer/.test(d.bodyText)) problems.push("FDE positioning missing from crawlable text");
      if (!/Software Engineer/.test(d.bodyText)) problems.push("Software Engineer copy missing");
      if (!d.jsonLd.length) problems.push("no JSON-LD");
      else {
        for (const raw of d.jsonLd) {
          try {
            JSON.parse(raw);
          } catch {
            problems.push("invalid JSON-LD");
          }
        }
      }
    }
    if (route === "/work/ariv-agentic-revenue-recovery") {
      if (hrefs.includes(EXPECTED_HREFS.arivRepo)) found.add("arivRepo");
      else problems.push("ARIV repository link missing");
    }
    if (route === "/definitely-not-a-page" && d.h1Count < 1 && !/not found|404/i.test(d.bodyText)) {
      problems.push("404 page has no heading / not-found copy");
    }

    if (route === "/definitely-not-a-page") {
      /* The document itself is served with status 404 by design, and the
         browser logs the expected "Failed to load resource ... 404" for it.
         Filter ONLY that expected log; real exceptions still fail the route. */
      for (let i = errors.length - 1; i >= 0; i--) {
        if (/Failed to load resource/.test(errors[i]) && /404/.test(errors[i])) {
          errors.splice(i, 1);
        }
      }
    }
    if (route !== "/definitely-not-a-page") {
      if (d.h1Count !== 1) problems.push(`h1 count ${d.h1Count} (expected 1)`);
      if (d.headingSkip) problems.push("heading level skip");
      if (d.imgsWithoutAlt.length) problems.push(`${d.imgsWithoutAlt.length} img without alt: ${d.imgsWithoutAlt[0]}`);
      if (d.iconOnly.length) problems.push(`unnamed icon-only control: ${d.iconOnly[0]}`);
      if (d.dupes.length) problems.push(`duplicate ids: ${d.dupes.join(", ")}`);
      if (d.danglingAria.length) problems.push(`dangling aria: ${d.danglingAria.join(", ")}`);
      if (!d.title || d.title.includes("localhost")) problems.push(`bad title: ${d.title}`);
      if (!d.description) problems.push("missing meta description");
      if (d.canonical.includes("localhost")) problems.push(`canonical is localhost: ${d.canonical}`);
      if (d.lang !== "en") problems.push(`html lang=${d.lang}`);
    }
    if (errors.length) problems.push(`${errors.length} console error(s): ${String(errors[0]).slice(0, 120)}`);
  }

  if (problems.length) {
    failures++;
    console.log(`FAIL ${route}`);
    for (const p of problems) console.log(`       - ${p}`);
  } else {
    console.log(`ok   ${route}`);
  }
}

console.log(`\nexpected hrefs seen: ${[...found].join(", ") || "none"}`);
for (const key of Object.keys(EXPECTED_HREFS)) {
  if (!found.has(key)) {
    failures++;
    console.log(`MISSING href: ${key} = ${EXPECTED_HREFS[key]}`);
  }
}
console.log(failures === 0 ? "\nDOM AUDIT CLEAN" : `\n${failures} route(s)/check(s) failed`);

ws.close();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}
process.exit(failures === 0 ? 0 : 1);
