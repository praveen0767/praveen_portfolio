/**
 * Release screenshots (dev-only QA tooling).
 *
 *   node qa-shots/release-shots.mjs
 *
 * Captures the homepage for visual review at every viewport the release brief
 * names, in dark theme, plus light theme at 1440 and 390. Pages taller than
 * Chrome's capture limit are split into two segments.
 *
 * Output: qa-shots/release-<theme>-<w>x<h>[-partN].png
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { writeFileSync, mkdirSync } from "node:fs";

const VIEWPORTS = [
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [820, 1180],
  [390, 844],
  [375, 812],
  [360, 800],
];
const LIGHT_VIEWPORTS = new Set(["1440x900", "390x844"]);
const MAX_CLIP = 15000;

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 56000 + Math.floor(Math.random() * 2000);
const BASE = process.env.QA_BASE || "http://localhost:3000";

mkdirSync("qa-shots", { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-shots-${process.pid}`,
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
    return;
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

async function settle() {
  await send(
    "Runtime.evaluate",
    {
      expression: `(async () => {
        const step = window.innerHeight * 0.5;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 140));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 700));
        return 1;
      })()`,
      awaitPromise: true,
    },
    sessionId,
  );
}

const shots = [];
for (const [W, H] of VIEWPORTS) {
  const themes = ["dark", ...(LIGHT_VIEWPORTS.has(`${W}x${H}`) ? ["light"] : [])];
  for (const theme of themes) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: W, height: H, deviceScaleFactor: 1, mobile: W < 500, screenWidth: W, screenHeight: H,
    }, sessionId);
    await send("Page.navigate", { url: `${BASE}/` }, sessionId);
    await sleep(2200);
    await send("Runtime.evaluate", { expression: `localStorage.setItem('praveen-theme','${theme}'); 1`, returnByValue: true }, sessionId);
    await send("Page.navigate", { url: `${BASE}/` }, sessionId);
    await sleep(2600);
    await settle();

    const geo = await send(
      "Runtime.evaluate",
      { expression: `JSON.stringify({ h: document.body.scrollHeight, w: document.documentElement.clientWidth })`, returnByValue: true },
      sessionId,
    );
    const g = JSON.parse(geo.result.value);
    const parts = Math.ceil(g.h / MAX_CLIP);
    for (let part = 0; part < parts; part++) {
      const y = part * MAX_CLIP;
      const height = Math.min(MAX_CLIP, g.h - y);
      const shot = await send(
        "Page.captureScreenshot",
        { format: "png", captureBeyondViewport: true, clip: { x: 0, y, width: g.w, height, scale: 1 } },
        sessionId,
      );
      const name = `qa-shots/release-${theme}-${W}x${H}${parts > 1 ? `-part${part + 1}` : ""}.png`;
      writeFileSync(name, Buffer.from(shot.data, "base64"));
      shots.push(name);
    }
    console.log(`captured ${theme} ${W}x${H} (${g.h}px tall, ${parts} part(s))`);
  }
}

console.log(`\n${shots.length} screenshots written`);
ws.close();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}
process.exit(0);
