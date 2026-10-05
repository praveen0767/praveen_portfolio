/**
 * Journey-spine and FDE-map connector geometry probe (dev-only QA tooling).
 *
 *   node qa-shots/connector-probe.mjs [w] [h]
 *
 * Reports, per viewport:
 *   - every journey dot and its connector segment, so the spine can be checked
 *     for continuity and for alignment with the node it hangs from
 *   - every FDE map connector box with its computed stroke/opacity, so an
 *     invisible connector is distinguishable from a missing one
 *   - the FDE map's total height against the hero's height budget
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const W = Number(process.argv[2] || 1440);
const H = Number(process.argv[3] || 900);

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 41000 + Math.floor(Math.random() * 9000);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-conn-${process.pid}`,
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

await send("Page.navigate", { url: "http://localhost:3000/" }, sessionId);
await sleep(4500);
// Reveal-on-scroll content: walk the page so every section lays out and any
// whileInView spine segment has entered the viewport.
await send(
  "Runtime.evaluate",
  {
    expression: `(async () => {
      const step = window.innerHeight * 0.6;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 900));
      return 1;
    })()`,
    awaitPromise: true,
  },
  sessionId,
);

const expr = `JSON.stringify((() => {
  const box = (el) => { const r = el.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) }; };

  /* ── Journey spine ─────────────────────────────────────────────── */
  const journey = [];
  const rows = [...document.querySelectorAll('.journey__row')];
  rows.forEach((row, i) => {
    const dot = row.querySelector('.journey__dot');
    const marker = row.querySelector('.journey__marker');
    const conn = row.querySelector('.journey__connector');
    const rowBox = box(row);
    const dotBox = dot ? box(dot) : null;
    const connBox = conn ? box(conn) : null;
    const markerBox = marker ? box(marker) : null;
    const ma = marker ? getComputedStyle(marker, '::after') : null;
    journey.push({
      i,
      rowTop: rowBox.t, rowBottom: rowBox.b,
      dot: dotBox,
      dotCentreY: dotBox ? Math.round(dotBox.t + dotBox.h / 2) : null,
      conn: connBox,
      connStroke: conn ? (() => { const cs = getComputedStyle(conn); return { display: cs.display, opacity: cs.opacity, bg: cs.backgroundImage.slice(0, 40) }; })() : null,
      hasMarkerAfter: ma ? ma.content !== 'none' : false,
      markerBox,
      markerAlign: marker ? getComputedStyle(marker).alignSelf : null,
      trackH: ma ? Math.round(parseFloat(ma.height) || 0) : 0,
      trackTop: ma ? Math.round(parseFloat(ma.top) || 0) : null,
      trackBottom: ma ? Math.round(parseFloat(ma.bottom) || 0) : null,
      trackW: ma ? Math.round(parseFloat(ma.width) || 0) : 0,
      trackBg: ma ? ma.backgroundImage.slice(0, 70) : null,
      title: row.querySelector('.journey__title')?.textContent?.trim().slice(0, 24) ?? '',
      flag: row.querySelector('.journey__flag')?.textContent?.trim() ?? null,
    });
  });

  /* ── FDE map (hero) connectors ─────────────────────────────────── */
  const mapEl = document.querySelector('.map');
  const links = [...document.querySelectorAll('.map__link-line')].map((svg, i) => {
    const cs = getComputedStyle(svg);
    const path = svg.querySelector('path');
    const ps = path ? getComputedStyle(path) : null;
    const pb = path ? path.getBoundingClientRect() : null;
    return {
      i,
      box: box(svg),
      display: cs.display,
      stroke: ps ? ps.stroke : null,
      strokeWidth: ps ? ps.strokeWidth : null,
      pathBox: pb ? { w: Math.round(pb.width), h: Math.round(pb.height) } : null,
      d: path ? path.getAttribute('d') : null,
    };
  });

  const mapBox = mapEl ? box(mapEl) : null;
  const heroEl = document.querySelector('section.hero');
  const nodes = [...document.querySelectorAll('.map__node')].map((n) => ({
    name: n.querySelector('.map__name')?.textContent?.trim() ?? '',
    box: box(n),
    active: n.hasAttribute('data-active'),
  }));

  /* ── Mobile FDE section ────────────────────────────────────────── */
  const badges = [...document.querySelectorAll('.mobile-fde__card-badge')].map((b) => b.textContent?.trim());
  const mconn = [...document.querySelectorAll('.mobile-fde__connector')].map((c) => {
    const cs = getComputedStyle(c);
    const line = c.querySelector('.mobile-fde__connector-line');
    return { box: box(c), display: cs.display, h: Math.round(c.getBoundingClientRect().height), lineH: line ? Math.round(line.getBoundingClientRect().height) : 0, lineW: line ? Math.round(line.getBoundingClientRect().width) : 0, lineBg: line ? getComputedStyle(line).backgroundImage.slice(0, 60) : null };
  });

  const deskBox = document.querySelector('.desk') ? box(document.querySelector('.desk')) : null;

  return {
    vw: document.documentElement.clientWidth,
    docW: document.documentElement.scrollWidth,
    bodyW: document.body.scrollWidth,
    journey,
    links,
    mapBox,
    heroBox: heroEl ? box(heroEl) : null,
    nodes,
    badges,
    mconn: mconn.slice(0, 3),
    mconnCount: mconn.length,
    deskBox,
  };
})())`;

const { result, exceptionDetails } = await send(
  "Runtime.evaluate",
  { expression: expr, returnByValue: true },
  sessionId,
);
if (exceptionDetails) throw new Error(exceptionDetails.text);
const d = JSON.parse(result.value);

console.log(`\n=== connector probe @ ${W}x${H} :: vw=${d.vw} doc=${d.docW} body=${d.bodyW} ===`);

console.log(`\n-- JOURNEY SPINE (${d.journey.length} rows) --`);
console.log("  #  title                 rowTop rowBot  dotY  markerH align  trackTop trackBot trackH trackW");
for (const j of d.journey) {
  console.log(
    `  ${String(j.i).padStart(2)} ${j.title.padEnd(21)} ${String(j.rowTop).padStart(6)} ${String(j.rowBottom).padStart(6)} ${String(j.dotCentreY).padStart(5)} ${String(j.markerBox?.h ?? 0).padStart(7)} ${String(j.markerAlign).padStart(6)} ${String(j.trackTop ?? "-").padStart(8)} ${String(j.trackBottom ?? "-").padStart(8)} ${String(j.trackH).padStart(6)} ${String(j.trackW).padStart(6)}${j.flag ? `  FLAG="${j.flag}"` : ""}`,
  );
}

console.log(`\n-- FDE MAP CONNECTORS (${d.links.length}) --`);
console.log("  #  boxL boxR  h   display  stroke       sw     pathW pathH  d");
for (const l of d.links) {
  console.log(
    `  ${l.i} ${String(l.box.l).padStart(5)} ${String(l.box.r).padStart(5)} ${String(l.box.h).padStart(4)}  ${l.display.padEnd(8)} ${String(l.stroke).padEnd(12)} ${String(l.strokeWidth).padEnd(6)} ${String(l.pathBox?.w ?? 0).padStart(5)} ${String(l.pathBox?.h ?? 0).padStart(5)}  ${l.d}`,
  );
}

console.log(`\n-- FDE MAP / HERO BUDGET --`);
console.log(`  map box        ${JSON.stringify(d.mapBox)}`);
console.log(`  hero box       ${JSON.stringify(d.heroBox)}`);
console.log(`  desk box       ${JSON.stringify(d.deskBox)}`);
console.log(`  map nodes      ${d.nodes.length}`);
for (const n of d.nodes) console.log(`    ${n.name.padEnd(16)} h=${String(n.box.h).padStart(4)} active=${n.active}`);

console.log(`\n-- MOBILE FDE SECTION (${d.mconnCount} connectors) --`);
console.log(`  badges: ${JSON.stringify(d.badges)}`);
for (const c of d.mconn) console.log(`  connector h=${c.h} display=${c.display} lineW=${c.lineW} lineH=${c.lineH} bg=${c.lineBg}`);

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}