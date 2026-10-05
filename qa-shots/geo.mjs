/**
 * Geometry probe (dev-only QA tooling).
 *
 *   node qa-shots/geo.mjs <route> <w> <h> [outPrefix]
 *
 * Dumps getBoundingClientRect + computed geometry for the canonical layout
 * chain so the first ancestor with bad width is obvious, then writes one
 * full-page screenshot per requested scroll stop.
 */
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const ROUTE = process.argv[2] || "/";
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 900);
const PREFIX = process.argv[5] || `geo-${ROUTE.replace(/\//g, "") || "home"}-${W}x${H}`;

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 41000 + Math.floor(Math.random() * 9000);

const SELECTORS = [
  "html",
  "body",
  "main",
  ".site-shell",
  "header.site-header",
  ".site-main",
  ".container",
  ".hero",
  ".hero__depth",
  ".hero__depth-near",
  ".hero__inner",
  ".hero__copy",
  ".desk",
  ".desk__plane--portrait",
  ".desk__stage",
  ".desk__portrait-img",
  ".desk__plane--map",
  ".map",
  "#ariv",
  "#ariv .ariv__inner",
  "#ariv .ariv__graph",
  ".others",
  ".others .work-row",
  ".capability",
  ".capability .cap-map",
  ".proof",
  ".achievements",
];

mkdirSync("qa-shots", { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-geo-${process.pid}`,
    "--no-first-run",
    "--no-default-browser-check",
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
await send("Log.enable", {}, sessionId);
await send("Emulation.setDeviceMetricsOverride", {
  width: W,
  height: H,
  deviceScaleFactor: 1,
  mobile: W < 500,
  screenWidth: W,
  screenHeight: H,
}, sessionId);

await send("Page.navigate", { url: `http://localhost:3000${ROUTE}` }, sessionId);
await sleep(3200);

const expr = `JSON.stringify((() => {
  const doc = document.documentElement;
  const out = {
    viewport: [window.innerWidth, window.innerHeight],
    docScrollWidth: doc.scrollWidth,
    docClientWidth: doc.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    docScrollHeight: doc.scrollHeight,
    overflowX: doc.scrollWidth - doc.clientWidth,
    bodyFont: getComputedStyle(document.body).fontFamily,
    els: [],
    offenders: [],
  };
  const sels = ${JSON.stringify(SELECTORS)};
  for (const sel of sels) {
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out.els.push({
        sel,
        left: Math.round(r.left),
        right: Math.round(r.right),
        top: Math.round(r.top + window.scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
        display: cs.display,
        position: cs.position,
        transform: cs.transform === "none" ? "" : cs.transform,
        minWidth: cs.minWidth,
        maxWidth: cs.maxWidth,
        overflowX: cs.overflowX,
      });
    }
  }
  // Any element sticking out horizontally past the viewport.
  const vw = doc.clientWidth;
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      const cs = getComputedStyle(el);
      out.offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === "string" ? el.className : "").slice(0, 70),
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width),
        position: cs.position,
      });
    }
  }
  out.offenders = out.offenders.slice(0, 40);
  return out;
})())`;

const { result, exceptionDetails } = await send(
  "Runtime.evaluate",
  { expression: expr, returnByValue: true },
  sessionId,
);
if (exceptionDetails) throw new Error(exceptionDetails.text);
const data = JSON.parse(result.value);

const vw = data.docClientWidth;
console.log(`\n=== ${ROUTE} @ ${W}x${H} ===`);
console.log(
  `viewport=${data.viewport} docClientWidth=${data.docClientWidth} docScrollWidth=${data.docScrollWidth} bodyScrollWidth=${data.bodyScrollWidth} overflowX=${data.overflowX}`,
);
console.log(`bodyFont=${data.bodyFont}`);
console.log("\n-- geometry --");
for (const e of data.els) {
  const flags = [];
  if (e.right > vw + 1) flags.push("OVERFLOW-RIGHT");
  if (e.left < -1) flags.push("OVERFLOW-LEFT");
  if (e.w > 0 && e.w < 300) flags.push("NARROW");
  if (e.transform) flags.push(`tf:${e.transform}`);
  console.log(
    `${e.sel.padEnd(28)} L=${String(e.left).padStart(5)} R=${String(e.right).padStart(5)} W=${String(e.w).padStart(5)} H=${String(e.h).padStart(5)} ${e.display}/${e.position} minw=${e.minWidth} maxw=${e.maxWidth} ${flags.join(" ")}`,
  );
}
console.log("\n-- offenders (outside viewport) --");
for (const o of data.offenders) {
  console.log(`${o.tag}.${o.cls} L=${o.left} R=${o.right} W=${o.w} pos=${o.position}`);
}

// screenshots at stops
const stops = JSON.parse(process.env.STOPS || "[0,900,1800,2700,3600,4500]");
for (const y of stops) {
  await send("Runtime.evaluate", { expression: `window.scrollTo({top:${y},behavior:'instant'})` }, sessionId);
  await sleep(700);
  const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  writeFileSync(`qa-shots/${PREFIX}-${y}.png`, Buffer.from(shot.data, "base64"));
}

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}