/**
 * Ad-hoc geometry probe (dev-only QA tooling).
 *
 *   node qa-shots/q.mjs <route> <w> <h> <selector,selector,...>
 *
 * Dumps rect + the layout properties that decide sizing for every match, plus
 * the widest overflowing descendant of each match.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const ROUTE = process.argv[2] || "/";
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 900);
const SELS = (process.argv[5] || ".container").split(",").map((s) => s.trim());

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 41000 + Math.floor(Math.random() * 9000);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-q-${process.pid}`,
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
  const props = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      d: desc(el),
      left: Math.round(r.left),
      right: Math.round(r.right),
      w: Math.round(r.width),
      clientW: el.clientWidth,
      scrollW: el.scrollWidth,
      display: cs.display,
      position: cs.position,
      width: cs.width,
      maxWidth: cs.maxWidth,
      minWidth: cs.minWidth,
      cols: cs.gridTemplateColumns,
      whiteSpace: cs.whiteSpace,
      overflowX: cs.overflowX,
      flex: cs.flex,
      gap: cs.gap,
      text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40),
    };
  };
  const out = [];
  for (const sel of ${JSON.stringify(SELS)}) {
    for (const el of document.querySelectorAll(sel)) {
      out.push(props(el));
      const kids = Array.from(el.querySelectorAll('*'))
        .map(props)
        .filter((p) => p.scrollW > p.clientW + 2)
        .sort((a, b) => b.scrollW - b.clientW - (a.scrollW - a.clientW))
        .slice(0, 4);
      if (kids.length) out.push(...kids);
    }
  }
  return out;
})())`;

const { result, exceptionDetails } = await send(
  "Runtime.evaluate",
  { expression: expr, returnByValue: true },
  sessionId,
);
if (exceptionDetails) throw new Error(exceptionDetails.text);
const rows = JSON.parse(result.value);

console.log(`\n=== ${ROUTE} @ ${W}x${H} ===`);
for (const r of rows) {
  console.log(
    `${r.d}\n    L=${r.left} R=${r.right} W=${r.w} client=${r.clientW} scroll=${r.scrollW} ${r.display}/${r.position} width=${r.width} minW=${r.minWidth} maxW=${r.maxWidth}\n    cols=${r.cols} ws=${r.whiteSpace} ovx=${r.overflowX} flex=${r.flex}\n    "${r.text}"`,
  );
}

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}