/**
 * Implicit-grid-track probe (dev-only QA tooling).
 *
 *   node qa-shots/gridauto.mjs <route> <w> <h>
 *
 * A `display: grid` element with no `grid-template-columns` gets one implicit
 * `auto` track. Auto tracks size to max-content and do NOT shrink to the
 * container, so any prose inside forces the element wider than its own box.
 * This lists every such element that is measurably overflowing, plus every
 * `display: grid` element whose only track exceeds its own clientWidth.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const ROUTE = process.argv[2] || "/";
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 900);

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 41000 + Math.floor(Math.random() * 9000);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-ga-${process.pid}`,
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
await send("Emulation.setDeviceMetricsOverride", {
  width: W,
  height: H,
  deviceScaleFactor: 1,
  mobile: W < 500,
  screenWidth: W,
  screenHeight: H,
}, sessionId);

await send("Page.navigate", { url: `http://localhost:3000${ROUTE}` }, sessionId);
await sleep(3500);

const expr = `JSON.stringify((() => {
  const desc = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? '#' + el.id : '') +
    (typeof el.className === 'string' && el.className ? '.' + el.className.split(/\\s+/).slice(0, 3).join('.') : '');
  const rows = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display !== 'grid' && cs.display !== 'inline-grid') continue;
    const tracks = cs.gridTemplateColumns.split(' ').filter(Boolean);
    const only = tracks.length === 1;
    const trackPx = only ? parseFloat(tracks[0]) : NaN;
    const implicitTooBig = only && Number.isFinite(trackPx) && trackPx > el.clientWidth + 2;
    const overflows = el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0;
    if (!implicitTooBig && !overflows) continue;
    rows.push({
      d: desc(el),
      tracks: cs.gridTemplateColumns,
      clientW: el.clientWidth,
      scrollW: el.scrollWidth,
      w: Math.round(el.getBoundingClientRect().width),
      overflows,
      text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 44),
    });
  }
  rows.sort((a, b) => (b.scrollW - b.clientW) - (a.scrollW - a.clientW));
  return rows;
})())`;

const { result, exceptionDetails } = await send(
  "Runtime.evaluate",
  { expression: expr, returnByValue: true },
  sessionId,
);
if (exceptionDetails) throw new Error(exceptionDetails.text);
const rows = JSON.parse(result.value);

console.log(`\n=== ${ROUTE} @ ${W}x${H} :: overflowing grid containers (${rows.length}) ===`);
for (const r of rows) {
  console.log(
    `client=${String(r.clientW).padStart(5)} scroll=${String(r.scrollW).padStart(5)} tracks=${r.tracks}\n   ${r.d}  | "${r.text}"`,
  );
}

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}