/**
 * Prose-overflow audit (dev-only QA tooling).
 *
 *   node qa-shots/nowrap.mjs <route> <w> <h>
 *
 * white-space is inherited, so every nowrap rule also affects that element's
 * subtree. This lists every element whose computed white-space is nowrap and
 * whose content actually overflows its own box — i.e. the declarations that
 * are visibly broken rather than merely load-bearing for short UI labels.
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
    `--user-data-dir=${process.env.TEMP}\\qa-nw-${process.pid}`,
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
  const bad = [];
  const ok = [];
  const desc = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? '#' + el.id : '') +
    (typeof el.className === 'string' && el.className ? '.' + el.className.split(/\\s+/).slice(0, 3).join('.') : '');
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.whiteSpace !== 'nowrap') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const rec = {
      d: desc(el),
      clientW: el.clientWidth,
      scrollW: el.scrollWidth,
      maxW: cs.maxWidth,
      text: (el.textContent || '').trim().slice(0, 48),
    };
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) bad.push(rec);
    else ok.push(rec);
  }
  return {
    docScrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    bad,
    okCount: ok.length,
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
  `\n=== ${ROUTE} @ ${W}x${H} :: clientWidth=${data.clientWidth} docScrollWidth=${data.docScrollWidth} bodyScrollWidth=${data.bodyScrollWidth} nowrapOverflowing=${data.bad.length} nowrapOk=${data.okCount} ===`,
);
for (const b of data.bad) {
  console.log(
    `  client=${String(b.clientW).padStart(5)} scroll=${String(b.scrollW).padStart(5)} maxw=${b.maxW}  ${b.d}  | "${b.text}"`,
  );
}

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}