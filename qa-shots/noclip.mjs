/**
 * No-global-clip verification probe (dev-only QA tooling).
 *
 *   node qa-shots/noclip.mjs
 *
 * Re-measures every route/viewport with the global
 * `html, body { overflow-x: hidden }` safety net force-disabled, so the
 * layout cannot pass by relying on the clip rather than real containment.
 *
 * Elements that intentionally bleed into the page gutter are listed
 * separately from real offenders.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const ROUTES = [
  "/",
  "/work",
  "/engineering",
  "/proof",
  "/achievements",
  "/lab",
  "/about",
  "/contact",
];
const VIEWPORTS =
  process.argv[2] === "mobile"
    ? [
        [360, 800],
        [375, 812],
        [412, 915],
        [430, 932],
      ]
    : [
        [1440, 900],
        [1280, 800],
        [1024, 768],
        [820, 1180],
        [390, 844],
      ];

/** Selectors whose right-edge bleed is a deliberate decorative overhang. */
const INTENTIONAL = [
  ".footer-brand",
  ".contact-cta__side",
  ".handoff",
  ".about-card",
  ".hero__bg",
  ".sysmap",
  ".arivsys__canvas",
];

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 41000 + Math.floor(Math.random() * 9000);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-nc-${process.pid}`,
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
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(new Error(JSON.stringify(m.error)));
    else p.resolve(m.result);
  }
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

const expr = `JSON.stringify((() => {
  const vw = document.documentElement.clientWidth;
  const intentional = ${JSON.stringify(INTENTIONAL)};
  const isIntentional = (el) => {
    for (const sel of intentional) { try { if (el.matches(sel) || el.closest(sel)) return true; } catch {} }
    return false;
  };
  const desc = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? '#' + el.id : '') +
    (typeof el.className === 'string' && el.className ? '.' + el.className.split(/\\s+/).slice(0, 4).join('.') : '');
  const bad = [];
  const decorative = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!(r.width > 0)) continue;
    if (r.right > vw + 1) {
      let clipped = false;
      let p = el.parentElement;
      while (p) {
        const pcs = getComputedStyle(p);
        if (pcs.overflowX !== 'visible' || pcs.overflowY !== 'visible') { clipped = true; break; }
        p = p.parentElement;
      }
      if (clipped) continue;
      const rec = { d: desc(el), left: Math.round(r.left), right: Math.round(r.right) };
      if (isIntentional(el)) decorative.push(rec);
      else bad.push(rec);
    }
  }
  bad.sort((a, b) => b.right - a.right);
  decorative.sort((a, b) => b.right - a.right);
  return {
    vw,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    bad: bad.slice(0, 12),
    decorative: decorative.slice(0, 6),
  };
})())`;

const failures = [];
const rows = [];

for (const [w, h] of VIEWPORTS) {
  await send(
    "Emulation.setDeviceMetricsOverride",
    {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile: w < 500,
      screenWidth: w,
      screenHeight: h,
    },
    sessionId,
  );
  for (const route of ROUTES) {
    await send("Page.navigate", { url: `http://localhost:3000${route}` }, sessionId);
    await sleep(2600);
    // Force-disable the global clip AFTER load so measurement is honest.
    await send(
      "Runtime.evaluate",
      {
        expression: `(function(){var s=document.createElement('style');s.setAttribute('data-qa','noclip');s.textContent='html,body{overflow-x:visible !important;overflow-y:visible !important;}';document.head.appendChild(s);return 1})()`,
      },
      sessionId,
    );
    await sleep(250);
    const { result, exceptionDetails } = await send(
      "Runtime.evaluate",
      { expression: expr, returnByValue: true },
      sessionId,
    );
    if (exceptionDetails) throw new Error(exceptionDetails.text);
    const d = JSON.parse(result.value);
    const overflows = d.docScrollWidth > d.vw || d.bodyScrollWidth > d.vw;
    const bad = overflows || d.bad.length > 0;
    const status = bad ? "FAIL" : "ok";
    if (bad) failures.push(`${route} @ ${w}x${h}`);
    rows.push(
      `${status.padEnd(4)} ${route.padEnd(14)} ${String(w).padStart(4)}x${String(h).padEnd(4)} vw=${String(d.vw).padStart(4)} doc=${String(d.docScrollWidth).padStart(4)} body=${String(d.bodyScrollWidth).padStart(4)} badEl=${d.bad.length} decoEl=${d.decorative.length}`,
    );
    if (d.bad.length) {
      for (const b of d.bad)
        rows.push(`       BAD  R=${String(b.right).padStart(5)} L=${String(b.left).padStart(5)} ${b.d}`);
    }
    for (const b of d.decorative)
      rows.push(`       deco R=${String(b.right).padStart(5)} L=${String(b.left).padStart(5)} ${b.d}`);
  }
}

console.log("\n=== no-global-clip overflow audit (overflow-x forced visible) ===");
for (const r of rows) console.log(r);
console.log(
  failures.length
    ? `\nRESULT: ${failures.length} FAILING combinations:\n  ${failures.join("\n  ")}`
    : `\nRESULT: all ${rows.length} route/viewport combinations contained without the global clip.`,
);

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}