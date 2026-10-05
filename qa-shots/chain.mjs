/**
 * Overflow root-cause probe (dev-only QA tooling).
 *
 *   node qa-shots/chain.mjs <route> <w> <h>
 *
 * Finds the elements that stick out past the viewport, then walks the ancestor
 * chain of the worst one printing rect + the layout properties that decide
 * whether that ancestor can shrink.
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
    `--user-data-dir=${process.env.TEMP}\\qa-chain-${process.pid}`,
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
  const rows = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.right <= vw + 1 && r.left >= -1) continue;
    const cs = getComputedStyle(el);
    rows.push({
      right: Math.round(r.right),
      left: Math.round(r.left),
      w: Math.round(r.width),
      scrollW: el.scrollWidth,
      clientW: el.clientWidth,
      desc: el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className : ''),
      position: cs.position,
      overflowX: cs.overflowX,
      el: el,
    });
  }
  rows.sort((a, b) => b.right - a.right);
  const worst = rows[0];
  const chain = [];
  if (worst) {
    let n = worst.el;
    while (n && n !== document.documentElement) {
      const r = n.getBoundingClientRect();
      const cs = getComputedStyle(n);
      chain.push({
        desc: n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + '.' + (typeof n.className === 'string' ? n.className.split(/\\s+/).join('.') : ''),
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width),
        clientW: n.clientWidth,
        scrollW: n.scrollWidth,
        display: cs.display,
        position: cs.position,
        minWidth: cs.minWidth,
        maxWidth: cs.maxWidth,
        width: cs.width,
        gridTemplateColumns: cs.gridTemplateColumns,
        whiteSpace: cs.whiteSpace,
        overflowX: cs.overflowX,
        flex: cs.flex,
      });
      n = n.parentElement;
    }
  }
  return {
    vw,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    worstRight: rows.slice(0, 12).map((r) => ({
      desc: r.desc.slice(0, 90),
      left: r.left,
      right: r.right,
      w: r.w,
      clientW: r.clientW,
      scrollW: r.scrollW,
      pos: r.position,
      ovx: r.overflowX,
    })),
    chain,
  };
})())`;

const { result, exceptionDetails } = await send(
  "Runtime.evaluate",
  { expression: expr, returnByValue: true },
  sessionId,
);
if (exceptionDetails) throw new Error(exceptionDetails.text + " " + (result?.description || ""));
const data = JSON.parse(result.value);

console.log(`\n=== ${ROUTE} @ ${W}x${H} :: clientWidth=${data.vw} docScrollWidth=${data.docScrollWidth} bodyScrollWidth=${data.bodyScrollWidth} ===`);
console.log("\n-- elements outside viewport (sorted by right edge) --");
for (const r of data.worstRight) {
  console.log(
    `R=${String(r.right).padStart(5)} L=${String(r.left).padStart(5)} W=${String(r.w).padStart(5)} client=${String(r.clientW).padStart(5)} scroll=${String(r.scrollW).padStart(5)} ${r.pos}/${r.ovx}  ${r.desc}`,
  );
}
console.log("\n-- ancestor chain of the worst offender --");
for (const c of data.chain) {
  console.log(
    `${c.desc}\n    L=${c.left} R=${c.right} W=${c.w} client=${c.clientW} scroll=${c.scrollW} ${c.display}/${c.position} width=${c.width} minW=${c.minWidth} maxW=${c.maxWidth} cols=${c.gridTemplateColumns} ws=${c.whiteSpace} ovx=${c.overflowX} flex=${c.flex}`,
  );
}

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}