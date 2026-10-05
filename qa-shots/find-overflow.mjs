import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 49100;
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=/tmp/insp-ovf-${process.pid}`,
  "--no-first-run",
  "--disable-gpu",
  "about:blank",
]);

await sleep(1000);
const ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const send = (m, p = {}) =>
  new Promise((res) => {
    const cur = ++id;
    const h = (ev) => {
      const d = JSON.parse(ev.data);
      if (d.id === cur) {
        ws.removeEventListener("message", h);
        res(d.result);
      }
    };
    ws.addEventListener("message", h);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

const t = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", {
  targetId: t.targetId,
  flatten: true,
});
await send(
  "Emulation.setDeviceMetricsOverride",
  {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1440,
    screenHeight: 900,
  },
  sessionId
);
await send("Page.navigate", { url: "http://localhost:3000/" }, sessionId);
await sleep(2500);

const res = await send(
  "Runtime.evaluate",
  {
    expression: `(()=>{
    const over = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 5 || r.left < -5) {
        over.push({
          tag: el.tagName,
          cls: el.className,
          id: el.id,
          right: Math.round(r.right),
          left: Math.round(r.left),
          width: Math.round(r.width)
        });
      }
    }
    return JSON.stringify(over.slice(0, 30));
  })()`,
    returnByValue: true,
  },
  sessionId
);

console.log(res.result?.value || res);
ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], {
    stdio: "ignore",
  });
} catch {}
