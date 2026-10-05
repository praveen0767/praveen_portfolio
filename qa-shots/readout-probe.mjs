/**
 * Tech Toolkit selected-technology detail card probe (dev-only QA tooling).
 *
 *   node qa-shots/readout-probe.mjs [w] [h]
 *
 * Selects every technology that can be reached from the default "Everything"
 * tab, then for each selection measures the detail card (.readout) and every
 * content element inside it, checking:
 *
 *   - content stays inside the card's padding box (left/right/bottom)
 *   - the element itself does not scroll horizontally (scrollWidth > clientWidth)
 *   - the card keeps a stable geometry across selections (no height jump)
 *
 * Exits non-zero if any real content violates the card boundary.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const W = Number(process.argv[2] || 1440);
const H = Number(process.argv[3] || 900);
const BASE = process.env.BASE_URL || "http://localhost:3000";

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 41000 + Math.floor(Math.random() * 9000);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-readout-${process.pid}`,
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

// Walk the page so reveal-on-scroll content lays out, then park on the toolkit.
await evaluate(`(async () => {
  const step = window.innerHeight * 0.6;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 110));
  }
  const t = document.getElementById('toolkit');
  if (t) t.scrollIntoView({ block: 'start' });
  await new Promise((r) => setTimeout(r, 700));
  return 1;
})()`, true);

/** Select a technology tile by name and return the detail-card measurements. */
const selectExpr = (name) => `(async () => {
  const tiles = [...document.querySelectorAll('.tech-tile')];
  const tile = tiles.find((t) => (t.querySelector('.tech-tile__name')?.textContent || '').trim() === ${JSON.stringify(name)});
  if (!tile) return { error: 'tile not visible: ' + ${JSON.stringify(name)} };
  tile.click();
  /* AnimatePresence mode="wait" unmounts the old body (220ms) before mounting
     the new one, which then animates y:8 -> 0 (220ms). Measuring earlier reads
     the in-flight transform as a bottom overflow, so wait for it to settle. */
  await new Promise((r) => setTimeout(r, 900));

  const card = document.querySelector('.readout');
  if (!card) return { error: 'no .readout' };
  const cs = getComputedStyle(card);
  const cr = card.getBoundingClientRect();
  const pad = {
    t: parseFloat(cs.paddingTop) || 0,
    r: parseFloat(cs.paddingRight) || 0,
    b: parseFloat(cs.paddingBottom) || 0,
    l: parseFloat(cs.paddingLeft) || 0,
  };
  const inner = {
    left: cr.left + pad.l,
    right: cr.right - pad.r,
    top: cr.top + pad.t,
    bottom: cr.bottom - pad.b,
  };

  const sels = [
    '.readout__body', '.readout__head', '.readout__mark', '.readout__name',
    '.readout__category', '.readout__role', '.readout__divider',
    '.readout__usage-label', '.readout__usage', '.readout__usage a',
    '.readout__usage-empty', '.readout__hint',
  ];
  const parts = [];
  const seen = new Set();
  for (const s of sels) {
    for (const el of document.querySelectorAll(s)) {
      if (seen.has(el)) continue;
      seen.add(el);
      const r = el.getBoundingClientRect();
      const ecs = getComputedStyle(el);
      parts.push({
        sel: s,
        text: (el.textContent || '').trim().slice(0, 46),
        l: +r.left.toFixed(1),
        r: +r.right.toFixed(1),
        t: +r.top.toFixed(1),
        b: +r.bottom.toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        overR: +(r.right - inner.right).toFixed(1),
        overL: +(inner.left - r.left).toFixed(1),
        overB: +(r.bottom - inner.bottom).toFixed(1),
        selfScroll: el.scrollWidth - el.clientWidth,
        ws: ecs.whiteSpace,
        wrap: ecs.overflowWrap,
        fontSize: ecs.fontSize,
        boxSizing: ecs.boxSizing,
        minWidth: ecs.minWidth,
      });
    }
  }

  // Any descendant text node wider than the card is a real escape.
  const escapes = [];
  for (const el of card.querySelectorAll('*')) {
    if (el.scrollWidth - el.clientWidth > 1) {
      escapes.push({
        cls: el.className && typeof el.className === 'string' ? el.className : el.tagName.toLowerCase(),
        over: el.scrollWidth - el.clientWidth,
        text: (el.textContent || '').trim().slice(0, 40),
      });
    }
  }

  return {
    card: { l: +cr.left.toFixed(1), r: +cr.right.toFixed(1), t: +cr.top.toFixed(1), b: +cr.bottom.toFixed(1), w: +cr.width.toFixed(1), h: +cr.height.toFixed(1) },
    pad,
    cardBoxSizing: cs.boxSizing,
    cardMinWidth: cs.minWidth,
    cardOverflow: card.scrollWidth - card.clientWidth,
    sectionH: +Math.round(document.getElementById('toolkit').getBoundingClientRect().height),
    panelH: +Math.round(document.querySelector('.playground__panel').getBoundingClientRect().height),
    parts,
    escapes,
    name: (document.querySelector('.readout__name')?.textContent || '').trim(),
  };
})()`;

const allNames = JSON.parse(
  await evaluate(`JSON.stringify([...document.querySelectorAll('.tech-tile .tech-tile__name')].map((n) => n.textContent.trim()))`),
);
const WANT = (process.env.TECH_LIST || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const names = WANT.length ? allNames.filter((n) => WANT.some((w) => n.toLowerCase() === w.toLowerCase())) : allNames;
if (WANT.length && names.length !== WANT.length) {
  const missing = WANT.filter((w) => !names.some((n) => n.toLowerCase() === w.toLowerCase()));
  console.log(`  !! not rendered on the default tab: ${missing.join(", ")}`);
}

console.log(`\n=== readout probe @ ${W}x${H} :: ${names.length} tiles on the default tab ===`);

const measureOnlyExpr = `(async () => {
  await new Promise((r) => setTimeout(r, 300));
  const card = document.querySelector('.readout');
  if (!card) return { error: 'no .readout' };
  const cs = getComputedStyle(card);
  const cr = card.getBoundingClientRect();
  const pad = { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
  const inner = { left: cr.left + pad.l, right: cr.right - pad.r, top: cr.top + pad.t, bottom: cr.bottom - pad.b };
  const parts = [];
  for (const el of card.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    parts.push({
      sel: '.' + (typeof el.className === 'string' && el.className ? el.className.split(' ')[0] : el.tagName.toLowerCase()),
      text: (el.textContent || '').trim().slice(0, 46),
      overR: +(r.right - inner.right).toFixed(1),
      overL: +(inner.left - r.left).toFixed(1),
      overB: +(r.bottom - inner.bottom).toFixed(1),
      selfScroll: el.scrollWidth - el.clientWidth,
    });
  }
  return {
    card: { l: +cr.left.toFixed(1), r: +cr.right.toFixed(1), t: +cr.top.toFixed(1), b: +cr.bottom.toFixed(1), w: +cr.width.toFixed(1), h: +cr.height.toFixed(1) },
    pad, cardBoxSizing: cs.boxSizing, cardMinWidth: cs.minWidth,
    cardOverflow: card.scrollWidth - card.clientWidth,
    sectionH: +Math.round(document.getElementById('toolkit').getBoundingClientRect().height),
    panelH: +Math.round(document.querySelector('.playground__panel').getBoundingClientRect().height),
    parts, escapes: [],
    name: '(empty / hint state)',
  };
})()`;

const results = [];
if (!names.length) {
  const d = await evaluate(measureOnlyExpr, true);
  if (!d.error) results.push({ name: "(no selection)", ...d });
  console.log("  (no selection made - measuring the default hint state)");
} else {
  for (const n of names) {
    const d = await evaluate(selectExpr(n), true);
    if (typeof d === "string") {
      console.log(`  !! ${n}: ${d}`);
      continue;
    }
    if (d.error) {
      console.log(`  !! ${n}: ${d.error}`);
      continue;
    }
    results.push({ name: n, ...d });
  }
}

const heights = results.map((r) => r.card.h);
const minH = Math.min(...heights);
const maxH = Math.max(...heights);
const secH = results.map((r) => r.sectionH);

console.log(`\n-- CARD GEOMETRY (padding l=${results[0]?.pad.l} r=${results[0]?.pad.r} t=${results[0]?.pad.t} b=${results[0]?.pad.b}) --`);
console.log(`   box-sizing=${results[0]?.cardBoxSizing} min-width=${results[0]?.cardMinWidth} cardW=${results[0]?.card.w}`);
console.log(
  `   card height: min=${minH} max=${maxH} delta=${(maxH - minH).toFixed(1)}`,
);
console.log(
  `   toolkit section height: min=${Math.min(...secH)} max=${Math.max(...secH)} delta=${Math.max(...secH) - Math.min(...secH)}`,
);
console.log(`   left panel height: ${results[0]?.panelH}`);

let fails = 0;
console.log(`\n-- PER-TECHNOLOGY BOUNDARY CHECK (overR/overL/overB in px, >0 = escapes card padding box) --`);
console.log("   tech                     cardW  cardH   worstOverR worstOverL worstOverB selfScroll");
for (const r of results) {
  const worst = (k) => Math.max(0, ...r.parts.map((p) => p[k] || 0));
  const scroll = Math.max(0, ...r.parts.map((p) => p.selfScroll || 0), r.cardOverflow);
  const overR = worst("overR");
  const overL = worst("overL");
  const overB = worst("overB");
  const bad = overR > 0.5 || overL > 0.5 || overB > 0.5 || scroll > 0;
  if (bad) fails++;
  console.log(
    `   ${bad ? "FAIL" : "ok  "} ${r.name.padEnd(22)} ${String(r.card.w).padStart(6)} ${String(r.card.h).padStart(6)} ${overR.toFixed(1).padStart(10)} ${overL.toFixed(1).padStart(10)} ${overB.toFixed(1).padStart(10)} ${String(scroll).padStart(10)}`,
  );
}

const offenders = new Map();
for (const r of results) {
  for (const p of r.parts) {
    const over = Math.max(p.overR || 0, p.overL || 0, p.overB || 0, p.selfScroll || 0);
    if (over > 0.5) {
      const key = `${p.sel} ws=${p.ws} wrap=${p.wrap}`;
      const prev = offenders.get(key) || { n: 0, over: 0, sample: p.text, techs: [] };
      prev.n++;
      prev.over = Math.max(prev.over, over);
      prev.sample = p.text || prev.sample;
      if (prev.techs.length < 4) prev.techs.push(r.name);
      offenders.set(key, prev);
    }
  }
}
if (offenders.size) {
  console.log(`\n-- OFFENDING ELEMENTS --`);
  for (const [k, v] of offenders) console.log(`   ${k}\n      worst=${v.over.toFixed(1)}px  count=${v.n}  e.g. "${v.sample}" [${v.techs.join(", ")}]`);
}

const page = JSON.parse(
  await evaluate(`JSON.stringify({ vw: document.documentElement.clientWidth, doc: document.documentElement.scrollWidth, body: document.body.scrollWidth })`),
);
console.log(`\n-- PAGE --\n   vw=${page.vw} doc=${page.doc} body=${page.body}`);
if (page.doc > page.vw) fails++;

console.log(`\nRESULT @ ${W}x${H}: ${fails === 0 ? "PASS" : `FAIL (${fails})`}`);

ws.close();
chrome.kill();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}

process.exitCode = fails === 0 ? 0 : 1;