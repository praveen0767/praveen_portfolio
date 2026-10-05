/**
 * Narrow-width overflow attribution probe (dev-only QA tooling).
 *
 *   node qa-shots/attr320.mjs
 *
 * Walks a specific section subtree and prints every descendant whose right
 * edge exceeds the section's own right edge, so the exact element forcing
 * page-level overflow at 320px can be identified rather than guessed at.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const W = Number(process.argv[2] || 320);
const H = Number(process.argv[3] || 720);
const ROOTS = (process.argv[4] || "section#capabilities,section#contact").split(",");

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 41000 + Math.floor(Math.random() * 9000);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-a32-${process.pid}`,
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
await send(
  "Emulation.setDeviceMetricsOverride",
  { width: W, height: H, deviceScaleFactor: 1, mobile: W < 500, screenWidth: W, screenHeight: H },
  sessionId,
);
await send("Page.navigate", { url: `http://localhost:3000/${ROOTS[0].includes("contact") ? "contact" : ""}` }, sessionId);
await sleep(4000);

const expr = `JSON.stringify((() => {
  const roots = ${JSON.stringify(ROOTS)};
  const desc = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? '#' + el.id : '') +
    (typeof el.className === 'string' && el.className ? '.' + el.className.split(/\\s+/).slice(0, 3).join('.') : '');
  const out = [];
  for (const sel of roots) {
    const root = document.querySelector(sel);
    if (!root) continue;
    const rr = root.getBoundingClientRect().right;
    const rows = [];
    const walk = (el, depth) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > rr + 1) {
        rows.push({ depth, d: desc(el), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), t: (el.textContent || '').trim().slice(0, 48) });
      }
      for (const c of el.children) walk(c, depth + 1);
    };
    for (const c of root.children) walk(c, 1);
    rows.sort((a, b) => b.right - a.right);
    out.push({ root: sel, rootRight: Math.round(rr), rows: rows.slice(0, 16) });
  }
  return out;
})())`;

const { result, exceptionDetails } = await send(
  "Runtime.evaluate",
  { expression: expr, returnByValue: true },
  sessionId,
);
if (exceptionDetails) throw new Error(exceptionDetails.text);
const data = JSON.parse(result.value);
for (const g of data) {
  console.log(`\n=== ${g.root} right=${g.rootRight} @ ${W}x${H} ===`);
  for (const r of g.rows)
    console.log(`${"  ".repeat(r.depth)}R=${String(r.right).padStart(5)} L=${String(r.left).padStart(5)} W=${String(r.w).padStart(5)} ${r.d}  |${r.t}|`);
}

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}