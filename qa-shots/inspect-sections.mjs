import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 43000 + Math.floor(Math.random() * 5000);
const chrome = spawn(
  CHROME,
  ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/sec-${process.pid}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", "about:blank"],
  { stdio: "ignore" }
);

async function cdp() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch {}
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

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
  screenWidth: 1440,
  screenHeight: 900,
}, sessionId);

await send("Page.navigate", { url: "http://localhost:3000/" }, sessionId);
await sleep(2500);

const sectionsData = await send("Runtime.evaluate", {
  expression: `JSON.stringify((()=>{
    const sections = Array.from(document.querySelectorAll('section, header, footer'));
    return sections.map(s => {
      const r = s.getBoundingClientRect();
      const cont = s.querySelector('.container');
      const cr = cont ? cont.getBoundingClientRect() : null;
      return {
        tag: s.tagName,
        id: s.id,
        cls: s.className,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right) },
        contRect: cr ? { x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height), left: Math.round(cr.left), right: Math.round(cr.right) } : null
      };
    });
  })())`,
  returnByValue: true
}, sessionId);

console.log("SECTIONS:", sectionsData.result.value);

// Capture screenshots scrolling through the page
const scrollPositions = [0, 800, 1600, 2400, 3200, 4000, 5000];
for (let i = 0; i < scrollPositions.length; i++) {
  const y = scrollPositions[i];
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` }, sessionId);
  await sleep(600);
  const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  writeFileSync(`qa-shots/home-scroll-${y}.png`, Buffer.from(shot.data, "base64"));
}

ws.close();
chrome.kill();
try { spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" }); } catch {}
