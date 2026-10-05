/**
 * Visual QA harness (dev-only tooling — not imported by the app).
 *
 *   node tools/shoot.mjs <base-url> <outdir>
 *
 * Optional environment:
 *   ROUTES=/,/work,/about   pages to visit (default: the homepage only)
 *   STOPS=top,mid,ariv,ariv2 scroll stops (homepage only)
 *   THEME=dark|light        stored theme (default dark)
 *   RM=1                    emulate prefers-reduced-motion
 *
 * Launches headless Chrome over CDP, records geometry (hero height, ARIV
 * offset, horizontal overflow, computed body font) and writes screenshots
 * named <route>-<w>x<h>-<stop>.png. Every capture carries a corner banner
 * naming itself so a shot can be identified from the image alone.
 */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.argv[2] || "http://localhost:3000";
const OUT = process.argv[3] || "qa-shots";
const ROUTES = (process.env.ROUTES || "/").split(",").map((r) => r.trim());
const STOPS = (process.env.STOPS || "top,mid,ariv,ariv2").split(",").map((r) => r.trim());
const THEME = process.env.THEME || "dark";
const RM = process.env.RM === "1";
const RUN = process.env.RUN || String(Date.now());

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const VIEWPORTS = [
  { name: "desktop", w: 1440, h: 900 },
  { name: "desktop-sm", w: 1280, h: 800 },
  { name: "tablet", w: 1024, h: 768 },
  { name: "tablet-port", w: 820, h: 1180 },
  { name: "mobile", w: 390, h: 844 },
];

const PORT = 12000 + Math.floor(Math.random() * 20000);
const profile = `/tmp/qa-chrome-${process.pid}`;

mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function cdp() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return (await res.json()).webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error("chrome did not start");
}

const ws = new WebSocket(await cdp());
let id = 0;
const pending = new Map();
const events = new Map();

ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id) {
    const p = pending.get(msg.id);
    if (p) {
    pending.delete(msg.id);
    if (msg.error) {
      p.reject(new Error(JSON.stringify(msg.error)));
    } else {
      p.resolve(msg.result);
    }
    }
  } else if (msg.method) {
    (events.get(msg.method) || []).forEach((fn) => fn(msg.params));
  }
});
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});

function send(method, params = {}, sessionId) {
  const msgId = ++id;
  return new Promise((resolve, reject) => {
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });
}

function once(method, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const list = events.get(method) || [];
    const fn = (params) => {
      clearTimeout(timer);
      events.set(method, list.filter((f) => f !== fn));
      resolve(params);
    };
    const timer = setTimeout(() => {
      events.set(method, list.filter((f) => f !== fn));
      reject(new Error(`timeout waiting for ${method}`));
    }, timeout);
    events.set(method, [...list, fn]);
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Emulation.setEmulatedMedia", {
  features: [
    { name: "prefers-color-scheme", value: THEME === "light" ? "light" : "dark" },
    ...(RM ? [{ name: "prefers-reduced-motion", value: "reduce" }] : []),
  ],
}, sessionId);
await send("Network.setCacheDisabled", { cacheDisabled: true }, sessionId);

async function evalIn(expression) {
  const { result, exceptionDetails } = await send(
    "Runtime.evaluate",
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (exceptionDetails) throw new Error(exceptionDetails.text);
  return result.value;
}

async function banner(text) {
  await evalIn(`(() => {
    const id = 'qa-banner';
    document.getElementById(id)?.remove();
    const el = document.createElement('div');
    el.id = id;
    el.textContent = ${JSON.stringify(text)};
    el.style.cssText = 'position:fixed;right:4px;bottom:4px;z-index:2147483647;background:#ffe600;color:#000;font:12px monospace;padding:2px 6px;border-radius:3px;pointer-events:none';
    document.body.appendChild(el);
    return true;
  })()`);
}

const report = [];

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    await send(
      "Emulation.setDeviceMetricsOverride",
      {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 1,
        mobile: vp.w < 500,
        screenWidth: vp.w,
        screenHeight: vp.h,
      },
      sessionId,
    );

    const loaded = once("Page.loadEventFired");
    await send("Page.navigate", { url: `${BASE}${route}` }, sessionId);
    await loaded;
    await sleep(1400);
    await evalIn(
      `localStorage.setItem('praveen-theme', ${JSON.stringify(THEME)}); document.documentElement.setAttribute('data-theme', ${JSON.stringify(THEME)}); true`,
    );
    await sleep(400);

    const font = await evalIn(`getComputedStyle(document.body).fontFamily`);
    if (!String(font).startsWith("Inter")) {
      throw new Error(`page not styled as expected on ${route}: ${font}`);
    }

    const geo = await evalIn(`(() => {
      const top = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height) };
      };
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      return {
        viewport: [window.innerWidth, window.innerHeight],
        docHeight: document.documentElement.scrollHeight,
        hero: top('.hero'),
        handoff: top('.handoff'),
        ariv: top('#ariv'),
        others: top('.others'),
        overflow,
        bodyFont: getComputedStyle(document.body).fontFamily,
      };
    })()`);

    const isHome = route === "/";
    const stops = isHome
      ? STOPS.map((key) => ({
          key,
          y:
            key === "top"
              ? 0
              : key === "mid"
                ? Math.round(vp.h * 0.9)
                : key === "ariv" && geo.ariv
                  ? Math.max(0, geo.ariv.top - 40)
                  : key === "ariv"
                    ? Math.round(vp.h * 1.5)
                    : geo.ariv
                      ? geo.ariv.top + Math.round(vp.h * 0.7)
                      : Math.round(vp.h * 2.4),
        }))
      : [
          { key: "top", y: 0 },
          { key: "mid", y: Math.round(vp.h * 0.9) },
        ];

    for (const stop of stops) {
      await evalIn(`window.scrollTo({ top: ${stop.y}, behavior: 'instant' }); true`);
      await sleep(750);
      const scrolled = await evalIn(`window.scrollY`);
      const stage = await evalIn(
        `(() => { const e = document.querySelector('.desk__stage'); return e ? Math.round(e.getBoundingClientRect().width) : -1; })()`,
      );
      await banner(
        `${route} ${vp.name} ${vp.w}x${vp.h} :: ${stop.key} @ ${scrolled}px | run=${RUN} stage=${stage}`,
      );
      await sleep(80);
      const shot = await send(
        "Page.captureScreenshot",
        { format: "png", captureBeyondViewport: false },
        sessionId,
      );
      const slug = route === "/" ? "home" : route.replace(/\//g, "");
      writeFileSync(`${OUT}/${slug}-${vp.w}x${vp.h}-${stop.key}.png`, Buffer.from(shot.data, "base64"));
      await evalIn(`document.getElementById('qa-banner')?.remove(); true`);
    }

    report.push({ route, name: vp.name, ...geo });
    console.log(JSON.stringify({ route, name: vp.name, ...geo }));
  }
}

console.log("\nSUMMARY");
console.log(
  report
    .filter((r) => r.route === "/")
    .map((r) => {
      const vh = r.viewport[1];
      const arivVh = r.ariv ? (r.ariv.top / vh).toFixed(2) : "n/a";
      const heroVh = r.hero ? (r.hero.height / vh).toFixed(2) : "n/a";
      const handoffVh = r.handoff ? (r.handoff.height / vh).toFixed(2) : "n/a";
      return `${r.name.padEnd(12)} vh=${vh} hero=${r.hero?.height}px (${heroVh}vh) handoff=${r.handoff?.height}px (${handoffVh}vh) arivTop=${r.ariv?.top}px (${arivVh}vh) overflow=${r.overflow}px`;
    })
    .join("\n"),
);

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {
  /* best effort */
}
rmSync(profile, { recursive: true, force: true });
