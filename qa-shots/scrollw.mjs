/**
 * Scroll-width attribution probe (dev-only QA tooling).
 *
 *   node qa-shots/scrollw.mjs <route> <w> <h>
 *
 * Lists every element whose scrollWidth exceeds its clientWidth, and every
 * element whose right edge exceeds the viewport, so the true source of the
 * page-level horizontal overflow is identifiable.
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
    `--user-data-dir=${process.env.TEMP}\\qa-sw-${process.pid}`,
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
  const vw = document.documentElement.clientWidth;
  const over = [];
  const wide = [];
  const desc = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? '#' + el.id : '') +
    (typeof el.className === 'string' && el.className ? '.' + el.className.split(/\\s+/).slice(0, 4).join('.') : '');
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
      wide.push({
        d: desc(el),
        clientW: el.clientWidth,
        scrollW: el.scrollWidth,
        ovx: cs.overflowX,
      });
    }
    if (r.width > 0 && r.right > vw + 1) {
      // is any ancestor clipping it?
      let clipped = false;
      let p = el.parentElement;
      while (p) {
        const pcs = getComputedStyle(p);
        if (pcs.overflowX !== 'visible' || pcs.overflowY !== 'visible') { clipped = true; break; }
        p = p.parentElement;
      }
      if (!clipped) {
        over.push({ d: desc(el), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), pos: cs.position });
      }
    }
  }
  over.sort((a, b) => b.right - a.right);
  wide.sort((a, b) => b.scrollW - a.scrollW);
  return {
    vw,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    unclipped: over.slice(0, 25),
    scrollOverflow: wide.slice(0, 25),
  };
})())`;

const { result, exceptionDetails } = await send(
  "Runtime.evaluate",
  { expression: expr, returnByValue: true },
  sessionId,
);
if (exceptionDetails) throw new Error(exceptionDetails.text);
const data = JSON.parse(result.value);

console.log(
  `\n=== ${ROUTE} @ ${W}x${H} :: clientWidth=${data.vw} docScrollWidth=${data.docScrollWidth} bodyScrollWidth=${data.bodyScrollWidth} ===`,
);
console.log("\n-- UNCLIPPED elements extending past the right viewport edge --");
if (!data.unclipped.length) console.log("(none)");
for (const r of data.unclipped)
  console.log(`R=${String(r.right).padStart(5)} L=${String(r.left).padStart(5)} W=${String(r.w).padStart(5)} ${r.pos}  ${r.d}`);

console.log("\n-- elements whose own content overflows their box (scrollWidth > clientWidth) --");
for (const r of data.scrollOverflow)
  console.log(`client=${String(r.clientW).padStart(5)} scroll=${String(r.scrollW).padStart(5)} ovx=${r.ovx}  ${r.d}`);

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}