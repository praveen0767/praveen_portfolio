/**
 * Hero optical-tune geometry probe (dev-only QA tooling).
 *
 *   node qa-shots/hero-tune.mjs            # probe only
 *   node qa-shots/hero-tune.mjs --shot     # probe + screenshots
 *
 * Measures the hero composition at the brief's viewports and prints the
 * numbers the tune is judged on:
 *   - topWhitespace: header bottom -> top of .hero__inner
 *   - hero content height, desk height, map height, portrait height
 *   - column overflow / horizontal scroll
 *   - all seven FDE layers still mounted and legible
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { writeFileSync } from "node:fs";

const VIEWPORTS = [
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [820, 1180],
  [390, 844],
  [375, 812],
  [360, 800],
];

const TAG = process.argv.includes("--tag")
  ? process.argv[process.argv.indexOf("--tag") + 1]
  : "hero";
const SHOT = process.argv.includes("--shot");

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 45000 + Math.floor(Math.random() * 4000);
const BASE = process.env.QA_BASE || "http://localhost:3000";

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-hero-${process.pid}`,
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
  const r = (sel) => document.querySelector(sel);
  const box = (sel) => {
    const el = r(sel);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      top: Math.round(b.top + window.scrollY),
      bottom: Math.round(b.bottom + window.scrollY),
      left: Math.round(b.left),
      right: Math.round(b.right),
      h: Math.round(b.height),
      w: Math.round(b.width),
      display: cs.display,
      padT: cs.paddingTop,
      padB: cs.paddingBottom,
      gap: cs.rowGap,
      fs: cs.fontSize,
    };
  };
  const hero = r('.hero');
  const header = r('header');
  const heroB = hero.getBoundingClientRect();
  const headerB = header ? header.getBoundingClientRect() : null;
  const inner = r('.hero__inner');
  const innerB = inner.getBoundingClientRect();

  const nodes = [...document.querySelectorAll('.map__node')];
  const layers = nodes.map((n) => {
    const b = n.getBoundingClientRect();
    const name = n.querySelector('.map__name');
    return {
      index: n.querySelector('.map__index')?.textContent || '',
      label: (name?.textContent || '').trim(),
      h: Math.round(b.height),
      w: Math.round(b.width),
      fs: name ? getComputedStyle(name).fontSize : null,
      visible: b.width > 0 && b.height > 0,
    };
  });

  const copy = r('.hero__copy');
  const map = r('.map');
  const deskMap = r('.desk__plane--map');
  const readout = r('.map__readout');
  const readoutVal = r('.map__readout-val');
  const readoutKey = r('.map__readout-key');
  const projects = r('.map__projects');
  const label = r('.map__label');
  const root = r('.map__root');
  const node01 = r('.map__graph .map__node');
  const portrait = r('.desk__portrait-img');
  const techs = document.querySelectorAll('.map__tech').length;
  const practices = document.querySelectorAll('.map__practice').length;
  const relLinks = document.querySelectorAll('.map__rel-link').length;

  const clipped = (el) => {
    if (!el) return false;
    const b = el.getBoundingClientRect();
    const p = el.parentElement.getBoundingClientRect();
    return b.right > p.right + 1 || b.bottom > p.bottom + 1 || b.left < p.left - 1;
  };

  return {
    vw: window.innerWidth,
    vh: window.innerHeight,
    heroH: Math.round(heroB.height),
    heroTop: Math.round(heroB.top + window.scrollY),
    headerBottom: headerB ? Math.round(headerB.bottom + window.scrollY) : 0,
    topWhitespace: Math.round(innerB.top - (headerB ? headerB.bottom + window.scrollY : 0)),
    heroPadTop: getComputedStyle(hero).paddingTop,
    inner: box('.hero__inner'),
    copy: box('.hero__copy'),
    desk: box('.desk'),
    deskStage: box('.desk__stage'),
    portrait: box('.desk__portrait-img'),
    deskMapPlane: box('.desk__plane--map'),
    map: box('.map'),
    mapLabel: box('.map__label'),
    mapRoot: box('.map__root'),
    node01: box('.map__graph .map__node'),
    console: box('.map__console'),
    readout: box('.map__readout'),
    readoutKey: box('.map__readout-key'),
    readoutVal: box('.map__readout-val'),
    projects: box('.map__projects'),
    cue: box('.hero__cue'),
    copyRight: copy ? Math.round(copy.getBoundingClientRect().right) : null,
    deskLeft: r('.desk') ? Math.round(r('.desk').getBoundingClientRect().left) : null,
    container: box('.hero .container'),
    layers,
    techs,
    practices,
    relLinks,
    techCount: nodes.length ? nodes.map((n) => n.querySelectorAll('.map__tech').length) : [],
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    mapClipped: clipped(map),
    readoutClipped: clipped(readoutVal),
    // copy column internals, so we can prove the left column did not move
    eyebrow: box('.hero__eyebrow'),
    title: box('.hero__title'),
    roles: box('.hero__roles'),
    claim: box('.hero__claim'),
    micro: box('.hero__micro'),
    actions: box('.hero__actions'),
    socials: box('.hero__social-row'),
    avail: box('.desk__avail'),
  };
})())`;

let failures = 0;
console.log(`\n### Hero geometry probe (${TAG})\n`);

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
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
      errors.push(m.params.entry.text);
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
  const idx = listeners.indexOf(onEvent);
  if (idx >= 0) listeners.splice(idx, 1);

  if (exceptionDetails) {
    console.log(`FAIL ${W}x${H}  probe error: ${exceptionDetails.text}`);
    failures++;
    continue;
  }

  const d = JSON.parse(result.value);
  const hidden = d.layers.filter((l) => !l.visible);
  const problems = [];
  if (d.overflow > 1) problems.push(`h-overflow ${d.overflow}px`);
  if (W >= 1024 && d.mapClipped) problems.push("map clipped by parent");
  if (d.readoutClipped) problems.push("readout value clipped");
  for (const e of errors) problems.push(`console: ${String(e).slice(0, 120)}`);

  const fmt = (b) => (b ? `${b.h}` : "-");
  console.log(
    `${W}x${H}  topWS=${d.topWhitespace}  hero=${d.heroH}  inner=${fmt(d.inner)}  ` +
      `copy=${fmt(d.copy)}  desk=${fmt(d.desk)}  map=${fmt(d.map)}  portrait=${fmt(d.portrait)}  ` +
      `cue=${fmt(d.cue)}  label=${fmt(d.mapLabel)}  root=${fmt(d.mapRoot)}  ` +
      `n01=${fmt(d.node01)}  console=${fmt(d.console)}`,
  );
  console.log(
    `         mapW=${d.map?.w ?? "-"}  gap=${d.copyRight != null ? d.deskLeft - d.copyRight : "-"}  ` +
      `techs=${d.techs} practices=${d.practices} rel=${d.relLinks}  ` +
      `layers=${d.layers.map((l) => l.index + ":" + l.label.slice(0, 4)).join(" ")}  ` +
      `hidden=${hidden.length}${hidden.length ? "(" + hidden.map((l) => l.index).join(",") + ")" : ""}  ` +
      `nameFs=${d.layers[0]?.fs}  padTop=${d.heroPadTop}`,
  );
  if (W >= 1024) {
    console.log(
      `         leftCol: eyebrow=${fmt(d.eyebrow)} title=${fmt(d.title)} roles=${fmt(d.roles)} ` +
        `claim=${fmt(d.claim)} micro=${fmt(d.micro)} actions=${fmt(d.actions)} socials=${fmt(d.socials)} avail=${fmt(d.avail)}`,
    );
  }
  if (problems.length) {
    failures++;
    for (const p of problems) console.log(`  FAIL  - ${p}`);
  }

  if (SHOT) {
    const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
    writeFileSync(`qa-shots/${TAG}-${W}x${H}.png`, Buffer.from(shot.data, "base64"));
  }
}

ws.close();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}
process.exit(failures === 0 ? 0 : 1);
