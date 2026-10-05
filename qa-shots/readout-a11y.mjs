/**
 * Tech Toolkit detail-card accessibility + logo check (dev-only QA tooling).
 *
 *   node qa-shots/readout-a11y.mjs [w] [h]
 *
 * Verifies, on the real production/dev markup:
 *   - tiles are real <button>s in the tab order with aria-pressed
 *   - keyboard focus alone selects a technology (no hover-only content)
 *   - focus-visible draws a visible ring
 *   - the readout is aria-live and re-announces the selection
 *   - brand logos keep their intrinsic box and are constrained
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const W = Number(process.argv[2] || 1440);
const H = Number(process.argv[3] || 900);
const BASE = process.env.BASE_URL || "http://localhost:3000";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 41000 + Math.floor(Math.random() * 9000);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-a11y-${process.pid}`,
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
await send(
  "Emulation.setDeviceMetricsOverride",
  { width: W, height: H, deviceScaleFactor: 1, mobile: W < 500, screenWidth: W, screenHeight: H },
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
  for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 110)); }
  document.getElementById('toolkit')?.scrollIntoView({ block: 'start' });
  await new Promise((r) => setTimeout(r, 700));
  return 1;
})()`, true);

const out = await evaluate(`(async () => {
  const tiles = [...document.querySelectorAll('.tech-tile')];
  const tabs = [...document.querySelectorAll('.playground__tab')];
  const readout = document.querySelector('.readout');

  // Keyboard-only selection: focus a tile without any pointer event.
  const target = tiles.find((t) => (t.querySelector('.tech-tile__name')?.textContent || '').trim() === 'PostgreSQL');
  target.focus();
  await new Promise((r) => setTimeout(r, 900));
  const focused = document.activeElement === target;
  const nameAfterFocus = (document.querySelector('.readout__name')?.textContent || '').trim();
  const pressedAfterFocus = target.getAttribute('aria-pressed');

  // focus-visible ring must be a real outline, not a suppressed one.
  const ring = getComputedStyle(target, null);
  const ringInfo = {
    outlineStyle: ring.outlineStyle,
    outlineWidth: ring.outlineWidth,
    boxShadow: ring.boxShadow.slice(0, 60),
  };

  const logos = [...document.querySelectorAll('.readout__mark img')].map((img) => {
    const r = img.getBoundingClientRect();
    return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), natural: img.naturalWidth, complete: img.complete };
  });
  const markBox = (() => {
    const m = document.querySelector('.readout__mark');
    if (!m) return null;
    const r = m.getBoundingClientRect();
    return { w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
  })();

  return {
    tileCount: tiles.length,
    tabCount: tabs.length,
    allTilesButtons: tiles.every((t) => t.tagName === 'BUTTON'),
    allTilesHaveAriaPressed: tiles.every((t) => t.hasAttribute('aria-pressed')),
    allTabsButtons: tabs.every((t) => t.tagName === 'BUTTON'),
    allTabsHaveAriaPressed: tabs.every((t) => t.hasAttribute('aria-pressed')),
    tabsGroupLabel: document.querySelector('.playground__tabs')?.getAttribute('aria-label') ?? null,
    readoutLive: readout?.getAttribute('aria-live') ?? null,
    keyboardSelectsWithoutHover: focused && nameAfterFocus === 'PostgreSQL',
    nameAfterFocus,
    pressedAfterFocus,
    ring: ringInfo,
    logos,
    markBox,
    hintText: (document.querySelector('.readout__hint')?.textContent || '').trim().slice(0, 70),
  };
})()`, true);

console.log(`\n=== readout a11y @ ${W}x${H} ===`);
console.log(JSON.stringify(out, null, 2));

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}