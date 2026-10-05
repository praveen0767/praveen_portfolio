import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 49500 + Math.floor(Math.random() * 2000);
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-btt-${process.pid}`,
    "--no-first-run",
    "--disable-gpu",
    "--hide-scrollbars",
    "about:blank",
  ],
  { stdio: "ignore" }
);

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("Chrome failed to start");
}

const ws = new WebSocket(await getWsUrl());
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

const viewports = [
  { name: "1440x900", w: 1440, h: 900, mobile: false },
  { name: "1280x800", w: 1280, h: 800, mobile: false },
  { name: "1024x768", w: 1024, h: 768, mobile: false },
  { name: "820x1180", w: 820, h: 1180, mobile: false },
  { name: "390x844", w: 390, h: 844, mobile: true },
  { name: "375x812", w: 375, h: 812, mobile: true },
  { name: "360x800", w: 360, h: 800, mobile: true },
];

console.log("============================================================");
console.log("BACK-TO-TOP QA VERIFICATION");
console.log("============================================================\n");

let allPass = true;

for (const vp of viewports) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: vp.w,
    height: vp.h,
    deviceScaleFactor: 1,
    mobile: vp.mobile,
    screenWidth: vp.w,
    screenHeight: vp.h,
  }, sessionId);

  await send("Page.navigate", { url: "http://localhost:3000/" }, sessionId);
  await sleep(1500);

  const checkScrollState = async (targetScroll) => {
    return await send("Runtime.evaluate", {
      expression: `(async () => {
        window.scrollTo({ top: ${targetScroll}, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
        await new Promise(r => setTimeout(r, 350));
        const btn = document.querySelector('.back-to-top');
        if (!btn) return { exists: false };
        const cs = getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        const isVisibleClass = btn.classList.contains('back-to-top--visible');
        const nav = document.querySelector('header');
        const navRect = nav ? nav.getBoundingClientRect() : null;
        const portrait = document.querySelector('.hero img[src*="praveen"]');
        const portRect = portrait ? portrait.getBoundingClientRect() : null;
        const map = document.querySelector('.map') || document.querySelector('.fde') || document.querySelector('.desk__plane--map');
        const mapRect = map ? map.getBoundingClientRect() : null;
        const interactiveCtas = Array.from(document.querySelectorAll('.hero__actions a, .hero__actions button, .hero__socials a'));

        const overlaps = (r1, r2) => {
          if (!r1 || !r2) return false;
          return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
        };

        const overlapsAnyCta = interactiveCtas.some(el => overlaps(rect, el.getBoundingClientRect()));

        return {
          exists: true,
          scrollY: window.scrollY,
          visibleClass: isVisibleClass,
          opacity: Math.round(Number(cs.opacity)),
          pointerEvents: cs.pointerEvents,
          rect: {
            top: Math.round(rect.top),
            right: Math.round(rect.right),
            bottom: Math.round(rect.bottom),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          overlapsNav: overlaps(rect, navRect),
          overlapsPortrait: overlaps(rect, portRect),
          overlapsMap: overlaps(rect, mapRect),
          overlapsCta: overlapsAnyCta,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    }, sessionId);
  };

  const s0 = (await checkScrollState(0)).result.value;
  const s50 = (await checkScrollState(50)).result.value;
  const s160 = (await checkScrollState(160)).result.value;
  const s300 = (await checkScrollState(300)).result.value;

  const pass0 = !s0.visibleClass && s0.opacity === 0;
  const pass50 = !s50.visibleClass && s50.opacity === 0;
  const pass160 = s160.visibleClass && s160.opacity === 1;
  const pass300 = s300.visibleClass && s300.opacity === 1;
  const noOverlap = !s160.overlapsNav && !s160.overlapsPortrait && !s160.overlapsMap && !s160.overlapsCta;

  if (!pass0 || !pass50 || !pass160 || !pass300 || !noOverlap) {
    allPass = false;
  }

  console.log(`Viewport: ${vp.name}`);
  console.log(`  scrollY=0:   visible=${s0.visibleClass}, opacity=${s0.opacity} (expected: false, 0) ${pass0 ? "✓" : "✗"}`);
  console.log(`  scrollY=50:  visible=${s50.visibleClass}, opacity=${s50.opacity} (expected: false, 0) ${pass50 ? "✓" : "✗"}`);
  console.log(`  scrollY=160: visible=${s160.visibleClass}, opacity=${s160.opacity} (expected: true, 1)  ${pass160 ? "✓" : "✗"}`);
  console.log(`  scrollY=300: visible=${s300.visibleClass}, opacity=${s300.opacity} (expected: true, 1)  ${pass300 ? "✓" : "✗"}`);
  console.log(`  Position at 160: top=${s160.rect.top}px, right=${s160.rect.right}px (${s160.rect.width}x${s160.rect.height})`);
  console.log(`  Overlaps: Nav=${s160.overlapsNav}, Portrait=${s160.overlapsPortrait}, Map=${s160.overlapsMap}, CTA/Social=${s160.overlapsCta} ${noOverlap ? "✓" : "✗"}`);

  // Capture screenshot at scroll 200
  await send("Runtime.evaluate", {
    expression: `window.scrollTo({ top: 200, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`,
  }, sessionId);
  await sleep(350);

  const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  writeFileSync(`qa-shots/final-btt-${vp.name}-scroll200.png`, Buffer.from(data, "base64"));
}

// Test smooth click to top
console.log("\n--- Testing Click to Scroll to Top ---");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
  screenWidth: 1440,
  screenHeight: 900,
}, sessionId);

await send("Runtime.evaluate", {
  expression: `window.scrollTo({ top: 400, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`,
}, sessionId);
await sleep(200);

const clickResult = (await send("Runtime.evaluate", {
  expression: `(async () => {
    const btn = document.querySelector('.back-to-top');
    const wasVisibleBefore = btn.classList.contains('back-to-top--visible');
    btn.click();
    await new Promise(r => setTimeout(r, 600));
    window.dispatchEvent(new Event('scroll'));
    return {
      wasVisibleBefore,
      scrollYAfterClick: window.scrollY,
      visibleAfterClick: btn.classList.contains('back-to-top--visible'),
      ariaLabel: btn.getAttribute('aria-label'),
      tagName: btn.tagName,
    };
  })()`,
  awaitPromise: true,
  returnByValue: true,
}, sessionId)).result.value;

console.log(`  Before click visible: ${clickResult.wasVisibleBefore}`);
console.log(`  After click scrollY:  ${clickResult.scrollYAfterClick}`);
console.log(`  After click visible:  ${clickResult.visibleAfterClick}`);
console.log(`  Aria label:           "${clickResult.ariaLabel}"`);
console.log(`  Tag name:             <${clickResult.tagName.toLowerCase()}>`);

// Check other routes for BackToTop presence
const otherRoutes = ["/", "/work", "/engineering", "/proof", "/achievements", "/lab", "/about", "/contact"];
console.log("\n--- Checking Routes (DOM uniqueness: exactly 1 per route) ---");
for (const route of otherRoutes) {
  await send("Page.navigate", { url: `http://localhost:3000${route}` }, sessionId);
  await sleep(1000);
  const routeRes = (await send("Runtime.evaluate", {
    expression: `(() => {
      const btns = document.querySelectorAll('.back-to-top');
      return { count: btns.length };
    })()`,
    returnByValue: true,
  }, sessionId)).result.value;
  console.log(`  Route ${route.padEnd(16)}: BackToTop count = ${routeRes.count} ${routeRes.count === 1 ? "✓" : "✗"}`);
}

ws.close();
chrome.kill();
console.log(`\n============================================================`);
console.log(`OVERALL RESULT: ${allPass ? "ALL CHECKS PASSED ✓" : "FAILURES DETECTED ✗"}`);
console.log(`============================================================`);
