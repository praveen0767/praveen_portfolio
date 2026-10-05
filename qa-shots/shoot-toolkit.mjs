/**
 * Tech Toolkit detail-card capture (dev-only QA tooling).
 *
 *   node qa-shots/shoot-toolkit.mjs [baseUrl] [outDir]
 *
 * For each required viewport it scrolls to #toolkit, selects the technology
 * with the longest description and the one with the longest project list, and
 * writes a screenshot of the toolkit plus the measured card rectangle. Nothing
 * here is imported by the app.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.argv[2] || "http://localhost:3000";
const OUT = process.argv[3] || "qa-shots/toolkit";

const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 41000 + Math.floor(Math.random() * 9000);

const VIEWPORTS = [
  { w: 1440, h: 900 },
  { w: 1280, h: 800 },
  { w: 1024, h: 768 },
  { w: 820, h: 1180 },
  { w: 390, h: 844 },
  { w: 375, h: 812 },
  { w: 360, h: 800 },
  { w: 320, h: 568 },
];

/** Longest description ("JavaScript") and the 4-project readout ("Python"). */
const SHOTS = [
  { tech: "JavaScript", tag: "long-desc" },
  { tech: "Python", tag: "four-projects" },
];

mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-shoot-tk-${process.pid}`,
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

const log = [];
for (const vp of VIEWPORTS) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send(
    "Emulation.setDeviceMetricsOverride",
    { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.w < 500, screenWidth: vp.w, screenHeight: vp.h },
    sessionId,
  );
  await send("Page.navigate", { url: `${BASE}/` }, sessionId);
  await sleep(4500);

  const evaluate = async (expression, awaitPromise = false) => {
    const { result, exceptionDetails } = await send(
      "Runtime.evaluate",
      { expression, returnByValue: true, awaitPromise },
      sessionId,
    );
    if (exceptionDetails) throw new Error(exceptionDetails.text);
    return result.value;
  };

  await evaluate(`(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 110));
    }
    document.getElementById('toolkit')?.scrollIntoView({ block: 'start' });
    await new Promise((r) => setTimeout(r, 700));
    return 1;
  })()`, true);

  for (const shot of SHOTS) {
    const info = await evaluate(`(async () => {
      const tile = [...document.querySelectorAll('.tech-tile')]
        .find((t) => (t.querySelector('.tech-tile__name')?.textContent || '').trim() === ${JSON.stringify(shot.tech)});
      if (!tile) return { error: 'tile missing' };
      tile.click();
      await new Promise((r) => setTimeout(r, 900));
      document.getElementById('toolkit')?.scrollIntoView({ block: 'start' });
      await new Promise((r) => setTimeout(r, 350));
      const card = document.querySelector('.readout');
      const r = card.getBoundingClientRect();
      return { card: { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } };
    })()`, true);

    const { data } = await send(
      "Page.captureScreenshot",
      { format: "png", captureBeyondViewport: false },
      sessionId,
    );
    const name = `toolkit-${vp.w}x${vp.h}-${shot.tag}.png`;
    writeFileSync(`${OUT}/${name}`, Buffer.from(data, "base64"));
    log.push(`${name} ${JSON.stringify(info)}`);
    console.log(`  ${name} ${JSON.stringify(info)}`);
  }

  await send("Target.closeTarget", { targetId });
}

writeFileSync(`${OUT}/index.txt`, log.join("\n"), "utf8");
ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}