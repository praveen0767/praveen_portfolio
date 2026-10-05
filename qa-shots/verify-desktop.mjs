import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 48200 + Math.floor(Math.random() * 5000);
const chrome = spawn(
  CHROME,
  ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/recov-${process.pid}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", "about:blank"],
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

const allSizes = [
  { w: 1440, h: 900, name: "desktop-1440x900.png", mobile: false },
  { w: 1280, h: 800, name: "desktop-1280x800.png", mobile: false },
  { w: 1024, h: 768, name: "desktop-1024x768.png", mobile: false },
  { w: 390, h: 844, name: "mobile-390x844.png", mobile: true },
  { w: 360, h: 800, name: "mobile-360x800.png", mobile: true },
  { w: 320, h: 568, name: "mobile-320x568.png", mobile: true },
  { w: 412, h: 915, name: "mobile-412x915.png", mobile: true },
];

const results = {};

for (const size of allSizes) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: size.w,
    height: size.h,
    deviceScaleFactor: 1,
    mobile: size.mobile,
    screenWidth: size.w,
    screenHeight: size.h,
  }, sessionId);

  await send("Page.navigate", { url: "http://localhost:3000/" }, sessionId);
  await sleep(2500);

  const evalRes = await send("Runtime.evaluate", {
    expression: `JSON.stringify((()=>{
      const hero = document.querySelector('.hero');
      const heroPortraits = hero ? Array.from(hero.querySelectorAll('img[src*="praveen"]')) : [];
      const cont = hero ? hero.querySelector('.container') : null;
      const inner = hero ? hero.querySelector('.hero__inner') : null;
      const copy = hero ? hero.querySelector('.hero__copy') : null;
      const desk = hero ? hero.querySelector('.desk') : null;
      const map = hero ? hero.querySelector('.desk__plane--map') : null;
      const titleName = hero ? hero.querySelector('.hero__title-name') : null;

      const visibleHeroPortraits = heroPortraits.filter(p => {
        const cs = getComputedStyle(p);
        const r = p.getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
      });

      return {
        viewport: { w: window.innerWidth, h: window.innerHeight },
        docScrollWidth: document.documentElement.scrollWidth,
        canScrollX: document.documentElement.scrollWidth > window.innerWidth,
        heroPortraitCount: visibleHeroPortraits.length,
        heroRect: hero ? hero.getBoundingClientRect() : null,
        contRect: cont ? cont.getBoundingClientRect() : null,
        innerRect: inner ? inner.getBoundingClientRect() : null,
        copyRect: copy ? copy.getBoundingClientRect() : null,
        deskRect: desk ? desk.getBoundingClientRect() : null,
        mapVisible: map ? (getComputedStyle(map).display !== 'none' && map.getBoundingClientRect().width > 0) : false,
        nameVisible: titleName ? (getComputedStyle(titleName).display !== 'none' && titleName.getBoundingClientRect().width > 0) : false
      };
    })())`,
    returnByValue: true
  }, sessionId);

  const data = JSON.parse(evalRes.result.value);
  results[`${size.w}x${size.h}`] = data;
  console.log(`[PASS CHECK] ${size.w}x${size.h}: canScrollX=${data.canScrollX}, heroPortraits=${data.heroPortraitCount}, nameVisible=${data.nameVisible}, mapVisible=${data.mapVisible}`);

  const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  writeFileSync(`qa-shots/${size.name}`, Buffer.from(shot.data, "base64"));
}

console.log("\nALL RESULTS SUMMARY:", JSON.stringify(results, null, 2));

ws.close();
chrome.kill();
try { spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" }); } catch {}
