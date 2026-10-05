/**
 * QA: captures the hero at 100% real zoom (deviceScaleFactor=1, NOT 0.9)
 * across all target viewports, scrolled to 100px so the button is visible.
 * Shows the button position in the upper-right hero space.
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 51000 + Math.floor(Math.random() * 3000);
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-btt100-${process.pid}`,
    "--no-first-run",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1", // ← hard 100% — no browser-level zoom
    "about:blank",
  ],
  { stdio: "ignore" }
);

async function getWs() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("Chrome failed to start");
}

const ws = new WebSocket(await getWs());
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
const send = (m, p = {}, s) =>
  new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, { resolve, reject });
    ws.send(JSON.stringify({ id: i, method: m, params: p, sessionId: s }));
  });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);

const viewports = [
  { name: "1440x900", w: 1440, h: 900, mobile: false },
  { name: "1280x800", w: 1280, h: 800, mobile: false },
  { name: "1024x768", w: 1024, h: 768, mobile: false },
  { name: "820x1180", w: 820, h: 1180, mobile: false },
  { name: "390x844",  w: 390,  h: 844, mobile: true  },
  { name: "375x812",  w: 375,  h: 812, mobile: true  },
];

console.log("QA at 100% zoom — button placement verification\n");

for (const vp of viewports) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: vp.w, height: vp.h,
    deviceScaleFactor: 1,   // ← always 1 (= 100% real zoom)
    mobile: vp.mobile,
    screenWidth: vp.w, screenHeight: vp.h,
  }, sessionId);

  await send("Page.navigate", { url: "http://localhost:3000/" }, sessionId);
  await sleep(1800);

  // Scroll to 100px so the button appears (threshold is 80px)
  await send("Runtime.evaluate", {
    expression: `window.scrollTo({ top: 100, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`,
  }, sessionId);
  await sleep(400);

  // Read button position
  const info = (await send("Runtime.evaluate", {
    expression: `(()=>{
      const btn = document.querySelector('.back-to-top');
      const b = btn.getBoundingClientRect();
      const cs = getComputedStyle(btn);
      return {
        visible: btn.classList.contains('back-to-top--visible'),
        top: Math.round(b.top), left: Math.round(b.left),
        bottom: Math.round(b.bottom), right: Math.round(b.right),
        opacity: cs.opacity,
        viewH: window.innerHeight,
        viewW: window.innerWidth,
      };
    })()`,
    returnByValue: true,
  }, sessionId)).result.value;

  const pct = ((info.top / info.viewH) * 100).toFixed(1);
  console.log(`${vp.name}: visible=${info.visible}, top=${info.top}px (${pct}% of ${info.viewH}px), right edge=${info.viewW - info.right}px from viewport right`);

  const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  writeFileSync(`qa-shots/btt100-${vp.name}-scroll100.png`, Buffer.from(data, "base64"));
  console.log(`  → saved qa-shots/btt100-${vp.name}-scroll100.png`);
}

ws.close();
chrome.kill();
console.log("\nDone.");
