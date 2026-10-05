/**
 * Diagram viewBox audit (dev-only QA tooling).
 *
 *   node qa-shots/svgprobe.mjs /work 430 932
 *
 * For every `.diagram` SVG it compares the declared viewBox against the
 * painted bounding box of its own children, so primitives authored outside
 * the viewBox are detected directly in user units instead of being inferred
 * from page-level overflow.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const ROUTE = process.argv[2] || "/work";
const W = Number(process.argv[3] || 430);
const H = Number(process.argv[4] || 932);

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 41000 + Math.floor(Math.random() * 9000);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-diag-${process.pid}`,
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
await send("Page.navigate", { url: `http://localhost:3000${ROUTE}` }, sessionId);
await sleep(4200);

const expr = `JSON.stringify((() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  for (const svg of document.querySelectorAll('svg.diagram')) {
    const vb = (svg.getAttribute('viewBox') || '').split(/[\\s,]+/).map(Number);
    const label = (svg.getAttribute('aria-label') || '').split(':')[0];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of svg.querySelectorAll('*')) {
      if (el.closest('animate, animateTransform')) continue;
      const b = el.getBBox ? (() => { try { return el.getBBox(); } catch { return null; } })() : null;
      if (!b || !(b.width > 0)) continue;
      minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width); maxY = Math.max(maxY, b.y + b.height);
    }
    if (!isFinite(maxX)) continue;
    const sr = svg.getBoundingClientRect();
    const scale = vb[2] ? sr.width / vb[2] : 1;
    out.push({
      label,
      viewBox: vb.join(' '),
      content: [minX, minY, maxX, maxY].map((n) => Math.round(n)).join(' '),
      overRight: Math.round(maxX - vb[2]),
      overBottom: Math.round(maxY - vb[3]),
      overLeft: Math.round(-minX),
      screenOverflowPx: Math.round((maxX - vb[2]) * scale),
      screenLeftPx: Math.round(sr.left + minX * scale - sr.left),
      screenLeftFromSvg: Math.round(minX * scale),
      screenRightFromSvg: Math.round(maxX * scale),
      svgW: Math.round(sr.width),
      overflow: getComputedStyle(svg).overflow,
    });
  }
  out.sort((a, b) => b.overRight - a.overRight);
  return { vw, out };
})())`;

const { result, exceptionDetails } = await send(
  "Runtime.evaluate",
  { expression: expr, returnByValue: true },
  sessionId,
);
if (exceptionDetails) throw new Error(exceptionDetails.text);
const data = JSON.parse(result.value);
const bad = data.out.filter((d) => d.overRight > 1 || d.overBottom > 1 || d.overLeft > 1);
console.log(
  `\n=== ${ROUTE} @ ${W}x${H}: ${data.out.length} diagrams, ${bad.length} exceed their viewBox ===`,
);
console.log("label                          viewBox                content bbox        overR  overB  overL  pxPast  svgW  leftOf  rightOf");
for (const d of data.out) {
  console.log(
    `${d.label.slice(0, 30).padEnd(31)} ${d.viewBox.padEnd(21)} ${d.content.padEnd(19)} ${String(d.overRight).padStart(5)} ${String(d.overBottom).padStart(6)} ${String(d.overLeft).padStart(6)} ${String(d.screenOverflowPx).padStart(7)} ${String(d.svgW).padStart(5)} ${String(d.screenLeftFromSvg).padStart(7)} ${String(d.screenRightFromSvg).padStart(8)}  overflow=${d.overflow}`,
  );
}

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}