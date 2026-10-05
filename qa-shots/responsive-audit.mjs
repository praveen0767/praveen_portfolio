/**
 * Responsive + theme release audit (dev-only QA tooling).
 *
 *   node qa-shots/responsive-audit.mjs
 *
 * For every viewport the release brief names (320 -> 1440) on the homepage:
 *   - no horizontal overflow, no element escaping the viewport
 *   - navbar present; the mobile menu actually opens and closes
 *   - exactly one visible hero portrait, correctly sized
 *   - name / FDE role copy present
 *   - touch targets on primary CTAs, socials and nav controls >= 40px
 *   - no text escaping its card (scrollWidth > clientWidth on content cards)
 *
 * Then a dark/light pass at 1440 and 390: background vs text contrast, logo
 * tiles still painted, borders still visible.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const VIEWPORTS = [
  [320, 568],
  [360, 800],
  [375, 812],
  [390, 844],
  [412, 915],
  [430, 932],
  [820, 1180],
  [1024, 768],
  [1280, 800],
  [1440, 900],
];

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 54000 + Math.floor(Math.random() * 2000);
const BASE = process.env.QA_BASE || "http://localhost:3000";

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-resp-${process.pid}`,
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
const listeners = [];
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(new Error(JSON.stringify(m.error)));
    else p.resolve(m.result);
    return;
  }
  for (const fn of listeners) fn(m);
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
await send("Log.enable", {}, sessionId);

const probe = `JSON.stringify((() => {
  const vw = document.documentElement.clientWidth;
  const visible = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
      if (n.hasAttribute('hidden')) return false;
    }
    return true;
  };
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('.tech-marquee, .marquee, svg')) continue;
    /* Only unconstrained overflow counts: anything an ancestor clips can never
       scroll the page, and the scrollWidth check below is the real oracle. */
    let clipped = false;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') { clipped = true; break; }
    }
    if (clipped) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > vw + 1.5 || r.left < -1.5)) {
      offenders.push((el.tagName + '.' + (typeof el.className === 'string' ? el.className.split(' ')[0] : '')).slice(0, 48));
    }
  }
  const cardSel = '.others__row, .trophy, .contact-channel, .journey__item, .achievement-card, .archive-row, .shelf-card';
  const squeezed = [...document.querySelectorAll(cardSel)]
    .filter((el) => el.scrollWidth > el.clientWidth + 2)
    .map((el) => (el.className || '').toString().split(' ')[0]);

  const portraits = [...document.querySelectorAll('img')].filter((i) => (i.currentSrc || i.src).includes('praveen'));
  const portrait = portraits.find(visible);
  const hero = document.querySelector('#top, section.hero, .hero');
  const heroPortraits = hero ? portraits.filter((p) => hero.contains(p)) : [];

  const targets = [];
  for (const sel of ['.btn', '.menu-trigger', '.social-btn', '.project__cta', '.journey__links a', '.dock__item', '.contact-channel']) {
    for (const el of document.querySelectorAll(sel)) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      targets.push({ sel, w: Math.round(r.width), h: Math.round(r.height) });
    }
  }

  const nav = document.querySelector('.navbar, header.navbar, nav');
  const menuBtn = document.querySelector('.menu-trigger');
  const text = document.body.innerText;

  return {
    overflow: document.documentElement.scrollWidth - vw,
    offenders: [...new Set(offenders)].slice(0, 6),
    squeezed: [...new Set(squeezed)],
    navVisible: visible(nav),
    menuButton: !!menuBtn,
    portraits: portraits.length,
    heroPortraits: heroPortraits.length,
    heroPortraitsVisible: heroPortraits.filter(visible).length,
    portraitVisible: portrait ? Math.round(portrait.getBoundingClientRect().width) : 0,
    portraitAlt: portrait ? portrait.getAttribute('alt') : null,
    hasName: text.includes('Praveen Kumar S'),
    hasFde: text.includes('Forward Deployed Engineer'),
    hasRoles: text.includes('AI Systems Builder'),
    smallTargets: targets.filter((t) => t.h < 40 || t.w < 40).slice(0, 8),
    targetCount: targets.length,
  };
})())`;

function contrast(rgbA, rgbB) {
  const lum = ([r, g, b]) => {
    const f = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const [l1, l2] = [lum(rgbA), lum(rgbB)].sort((a, b) => b - a);
  return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100;
}

function parseRgb(value) {
  const m = value.match(/(\d+)\D+(\d+)\D+(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

let failures = 0;
console.log("\n### responsive audit\n");

for (const [W, H] of VIEWPORTS) {
  const errors = [];
  const onEvent = (m) => {
    if (m.sessionId && m.sessionId !== sessionId) return;
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      errors.push((m.params.args || []).map((a) => a.value ?? a.description ?? "").join(" "));
    }
    if (m.method === "Runtime.exceptionThrown") {
      errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    }
  };
  listeners.push(onEvent);

  await send("Emulation.setDeviceMetricsOverride", {
    width: W,
    height: H,
    deviceScaleFactor: 1,
    mobile: W < 500,
    screenWidth: W,
    screenHeight: H,
  }, sessionId);
  await send("Page.navigate", { url: `${BASE}/` }, sessionId);
  await sleep(3200);

  const { result, exceptionDetails } = await send(
    "Runtime.evaluate",
    { expression: probe, returnByValue: true },
    sessionId,
  );

  const problems = [];
  if (exceptionDetails) problems.push(`probe error ${exceptionDetails.text}`);
  if (!exceptionDetails) {
    const d = JSON.parse(result.value);
    if (d.overflow > 1) problems.push(`horizontal overflow ${d.overflow}px`);
    if (d.offenders.length) problems.push(`elements past viewport: ${d.offenders.join(", ")}`);
    if (d.squeezed.length) problems.push(`text escaping cards: ${d.squeezed.join(", ")}`);
    if (!d.navVisible) problems.push("navbar not visible");
    if (d.heroPortraits !== 1 || d.heroPortraitsVisible !== 1) {
      problems.push(`hero portraits ${d.heroPortraits} (${d.heroPortraitsVisible} visible, expected 1/1)`);
    }
    if (d.portraitVisible < 80) problems.push(`portrait rendered width ${d.portraitVisible}px`);
    if (!d.portraitAlt) problems.push("portrait missing alt");
    if (!d.hasName || !d.hasFde || !d.hasRoles) problems.push("identity / FDE copy missing");

    /* Mobile menu behaviour, only where the trigger exists. */
    if (W <= 767) {
      if (!d.menuButton) problems.push("mobile menu trigger missing");
      else {
        await send(
          "Runtime.evaluate",
          { expression: `(() => { document.querySelector('.menu-trigger').click(); return 1; })()`, returnByValue: true },
          sessionId,
        );
        await sleep(400);
        const open = await send(
          "Runtime.evaluate",
          { expression: `(() => { const panel = document.getElementById('mobile-navigation'); return JSON.stringify({ open: !panel.hidden, links: panel.querySelectorAll('a[href]').length }); })()`, returnByValue: true },
          sessionId,
        );
        const state = JSON.parse(open.result.value);
        if (!state.open) problems.push("mobile menu did not open");
        if (state.links < 3) problems.push(`mobile menu has ${state.links} links`);
        await send(
          "Runtime.evaluate",
          { expression: `(() => { document.querySelector('.menu-trigger').click(); return 1; })()`, returnByValue: true },
          sessionId,
        );
        await sleep(400);
        const close = await send(
          "Runtime.evaluate",
          { expression: `document.getElementById('mobile-navigation').hidden`, returnByValue: true },
          sessionId,
        );
        if (close.result.value !== true) problems.push("mobile menu did not close");
      }
    }

    if (W < 500 && d.smallTargets.length) {
      const worst = d.smallTargets[0];
      problems.push(`${d.smallTargets.length}/${d.targetCount} touch targets under 40px (e.g. ${worst.sel} ${worst.w}x${worst.h})`);
    }
    if (errors.length) problems.push(`${errors.length} console error(s): ${String(errors[0]).slice(0, 120)}`);
  }

  const idx = listeners.indexOf(onEvent);
  if (idx >= 0) listeners.splice(idx, 1);

  if (problems.length) {
    failures++;
    console.log(`FAIL ${W}x${H}`);
    for (const p of problems) console.log(`       - ${p}`);
  } else {
    console.log(`ok   ${W}x${H}`);
  }
}

/* ── theme pass ─────────────────────────────────────────────────────────── */
console.log("\n### theme audit\n");
for (const [W, H] of [[1440, 900], [390, 844]]) {
  for (const theme of ["dark", "light"]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: W, height: H, deviceScaleFactor: 1, mobile: W < 500, screenWidth: W, screenHeight: H,
    }, sessionId);
    await send("Page.navigate", { url: `${BASE}/` }, sessionId);
    await sleep(2200);
    await send("Runtime.evaluate", { expression: `localStorage.setItem('praveen-theme','${theme}'); 1`, returnByValue: true }, sessionId);
    await send("Page.navigate", { url: `${BASE}/` }, sessionId);
    await sleep(2600);

    const { result, exceptionDetails } = await send(
      "Runtime.evaluate",
      {
        expression: `JSON.stringify((() => {
          const cs = getComputedStyle(document.body);
          const heading = document.querySelector('.section-title, h1, h2');
          const btn = document.querySelector('.btn--primary');
          const card = document.querySelector('.others__row, .trophy');
          const logo = document.querySelector('.tech-mark img');
          return {
            applied: document.documentElement.getAttribute('data-theme'),
            bg: cs.backgroundColor,
            text: cs.color,
            headingText: heading ? getComputedStyle(heading).color : null,
            btnBg: btn ? getComputedStyle(btn).backgroundColor : null,
            btnText: btn ? getComputedStyle(btn).color : null,
            border: card ? getComputedStyle(card).borderTopColor : null,
            logos: document.querySelectorAll('.tech-mark img').length,
            logoRendered: logo ? logo.naturalWidth : 0,
            heroPortraits: (() => { const hero = document.querySelector('#top, section.hero, .hero'); return hero ? [...hero.querySelectorAll('img')].filter((i) => (i.currentSrc || i.src).includes('praveen')).length : 0; })(),
          };
        })())`,
        returnByValue: true,
      },
      sessionId,
    );

    const problems = [];
    if (exceptionDetails) problems.push(`probe error ${exceptionDetails.text}`);
    if (!exceptionDetails) {
      const d = JSON.parse(result.value);
      if (d.applied !== theme) problems.push(`theme not applied (got ${d.applied})`);
      const ratio = contrast(parseRgb(d.bg), parseRgb(d.text));
      if (ratio < 4.5) problems.push(`body text contrast ${ratio}:1`);
      const hratio = d.headingText ? contrast(parseRgb(d.bg), parseRgb(d.headingText)) : 0;
      if (hratio < 4.5) problems.push(`heading contrast ${hratio}:1`);
      if (d.heroPortraits !== 1) problems.push(`hero portrait count ${d.heroPortraits}`);
      if (d.logos > 0 && d.logoRendered === 0) problems.push("tech logo not rendering");
      if (d.border === "rgba(0, 0, 0, 0)") problems.push("card border invisible");
    }
    if (problems.length) {
      failures++;
      console.log(`FAIL ${theme} @ ${W}x${H}`);
      for (const p of problems) console.log(`       - ${p}`);
    } else {
      console.log(`ok   ${theme} @ ${W}x${H}  contrast ${contrast(parseRgb(JSON.parse(result.value).bg), parseRgb(JSON.parse(result.value).text))}:1`);
    }
  }
}

console.log(`\n${failures === 0 ? "RESPONSIVE + THEME CLEAN" : `${failures} check(s) failed`}`);
ws.close();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}
process.exit(failures === 0 ? 0 : 1);
