/**
 * Focused grid-stretch diagnostic for the journey spine (dev-only QA tooling).
 *
 *   node qa-shots/spine-diag.mjs [w] [h]
 *
 * Explains why the connector pseudo-element is not spanning its row: reports
 * the marker's real box, the row's resolved grid tracks, and whether the marker
 * is actually a grid item of the row (it is only a grid item because
 * `.journey__item` is `display: contents`).
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const W = Number(process.argv[2] || 1440);
const H = Number(process.argv[3] || 900);

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 41000 + Math.floor(Math.random() * 9000);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-spine-${process.pid}`,
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
await send("Page.navigate", { url: "http://localhost:3000/" }, sessionId);
await sleep(4200);
await send(
  "Runtime.evaluate",
  {
    expression: `(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.6) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 110));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 700));
      return 1;
    })()`,
    awaitPromise: true,
  },
  sessionId,
);

const expr = `JSON.stringify((() => {
  const row = document.querySelector('.journey__row');
  const marker = row.querySelector('.journey__marker');
  const body = row.querySelector('.journey__body');
  const item = row.querySelector('.journey__item');
  const rc = getComputedStyle(row);
  const mc = getComputedStyle(marker);
  const ic = item ? getComputedStyle(item) : null;
  const kids = [];
  for (const el of row.children) {
    const cs = getComputedStyle(el);
    kids.push({
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className : '',
      display: cs.display,
      col: cs.gridColumnStart + '/' + cs.gridColumnEnd,
      row: cs.gridRowStart + '/' + cs.gridRowEnd,
      h: Math.round(el.getBoundingClientRect().height),
      top: Math.round(el.getBoundingClientRect().top),
    });
  }
  return {
    rowH: Math.round(row.getBoundingClientRect().height),
    rowDisplay: rc.display,
    rowAlignItems: rc.alignItems,
    rowTemplateRows: rc.gridTemplateRows,
    rowTemplateCols: rc.gridTemplateColumns,
    markerAlignSelf: mc.alignSelf,
    markerBoxH: Math.round(marker.getBoundingClientRect().height),
    bodyBoxH: Math.round(body.getBoundingClientRect().height),
    itemDisplay: ic ? ic.display : null,
    kids,
  };
})())`;

const { result, exceptionDetails } = await send(
  "Runtime.evaluate",
  { expression: expr, returnByValue: true },
  sessionId,
);
if (exceptionDetails) throw new Error(exceptionDetails.text);
console.log(`\n=== spine diagnostic @ ${W}x${H} ===`);
for (const [k, v] of Object.entries(JSON.parse(result.value))) console.log(`  ${k.padEnd(18)} ${v}`);

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}