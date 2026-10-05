import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

/**
 * Above-the-fold and desk-composition check.
 *
 *   node qa-shots/fold.mjs
 *
 * Reports, per viewport: where the hero's last piece of content lands relative
 * to the fold, whether the portrait and the tech stack overlap, and whether
 * anything escapes the viewport.
 */
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 30000 + Math.floor(Math.random() * 9000);
const VIEWPORTS = [
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [820, 1180],
  [390, 844],
];

const chrome = spawn(
  CHROME,
  ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/fold-${process.pid}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", "about:blank"],
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
  throw new Error("chrome did not start");
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
await send("Network.setCacheDisabled", { cacheDisabled: true }, sessionId);

const EXPR = `(() => {
  const rect = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const pieces = ['.hero__copy', '.hero__roles', '.hero__social-row', '.hero__actions', '.desk', '.hero__cue', '.desk__stack']
    .map((s) => [s, rect(s)]).filter(([, r]) => r);
  const lastBottom = Math.max(...pieces.map(([, r]) => r.b));
  const stage = rect('.desk__stage');
  const stack = rect('.desk__stack');
  const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  const escapees = [...document.querySelectorAll('body *')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      if (el.closest('.pointer-fx') || el.classList.contains('hero__bg-orb')) return false;
      return r.right > innerWidth + 1 || r.left < -1;
    })
    .slice(0, 6)
    .map((el) => (typeof el.className === 'string' ? el.className.split(' ').slice(0, 2).join('.') : el.tagName));
  return {
    vw: innerWidth, vh: innerHeight,
    hero: rect('.hero'),
    lastBottom,
    fitsAboveFold: lastBottom <= innerHeight,
    pieces: Object.fromEntries(pieces),
    stage, stack,
    overlap: stage && stack && stage.r > stack.l && Math.abs((stage.t + stage.b) / 2 - (stack.t + stack.b) / 2) < (stage.h + stack.h) / 2,
    stackRightEdge: stack ? stack.r : null,
    overflow,
    escapees,
  };
})()`;

for (const [w, h] of VIEWPORTS) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500, screenWidth: w, screenHeight: h }, sessionId);
  const nav = await send("Page.navigate", { url: "http://localhost:3000/" }, sessionId);
  await sleep(2600);
  const out = await send("Runtime.evaluate", { expression: EXPR, returnByValue: true }, sessionId);
  console.log(JSON.stringify(out.result.value));
  if (nav.frameId === undefined) { /* no-op */ }
}

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {
  /* best effort */
}
