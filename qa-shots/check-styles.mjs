import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 49200;
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=/tmp/insp-rules-${process.pid}`,
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
  new Promise((res, rej) => {
    const cur = ++id;
    const h = (ev) => {
      const d = JSON.parse(ev.data);
      if (d.id === cur) {
        ws.removeEventListener("message", h);
        if (d.error) rej(d.error);
        else res(d.result);
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
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
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
const r = await send(
  "Runtime.evaluate",
  {
    expression: `(()=>{
      const c = document.querySelector('.hero .container');
      const cs = getComputedStyle(c);
      const hero = document.querySelector('.hero');
      const hcs = getComputedStyle(hero);
      const inner = document.querySelector('.hero__inner');
      const ics = getComputedStyle(inner);
      const copy = document.querySelector('.hero__copy');
      const cpcs = getComputedStyle(copy);
      const desk = document.querySelector('.desk');
      const dcs = getComputedStyle(desk);
      return JSON.stringify({
        c_width: cs.width,
        c_maxWidth: cs.maxWidth,
        c_marginInline: cs.marginLeft + ' ' + cs.marginRight,
        c_paddingInline: cs.paddingLeft + ' ' + cs.paddingRight,
        c_rect: c.getBoundingClientRect(),
        inner_width: ics.width,
        inner_maxWidth: ics.maxWidth,
        inner_display: ics.display,
        inner_cols: ics.gridTemplateColumns,
        inner_rect: inner.getBoundingClientRect(),
        copy_rect: copy.getBoundingClientRect(),
        desk_rect: desk.getBoundingClientRect()
      });
    })()`,
    returnByValue: true,
  },
  sessionId
);
console.log(r.result.value);
ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], {
    stdio: "ignore",
  });
} catch {}
