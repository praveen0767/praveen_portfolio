import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 47000 + Math.floor(Math.random() * 9000);
const chrome = spawn(
  CHROME,
  ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/cap1024-${process.pid}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", "about:blank"],
  { stdio: "ignore" },
);

async function cdp() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch {
      /* retry */
    }
    await sleep(250);
  }
  throw new Error("no chrome");
}

const ws = new WebSocket(await cdp());
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
await send("Network.setCacheDisabled", { cacheDisabled: true }, sessionId);
await send(
  "Emulation.setDeviceMetricsOverride",
  { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false, screenWidth: 1024, screenHeight: 768 },
  sessionId,
);

await send("Page.navigate", { url: "http://localhost:3000/" }, sessionId);
await sleep(2200);

const out = await send(
  "Runtime.evaluate",
  {
    expression: `JSON.stringify((()=>{
      const stage = document.querySelector('.desk__stage');
      const r = stage.getBoundingClientRect();
      const badge = [...document.querySelectorAll('.desk__badge')].map(b => Math.round(b.getBoundingClientRect().right));
      return { stageWidth: Math.round(r.width), cssWidth: getComputedStyle(stage).width, maxBadgeRight: Math.max(...badge), vw: innerWidth };
    })())`,
    returnByValue: true,
  },
  sessionId,
);
console.log(out.result.value);

const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
writeFileSync("qa-shots/m2-1024-CAP.png", Buffer.from(shot.data, "base64"));
ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {
  /* best effort */
}
