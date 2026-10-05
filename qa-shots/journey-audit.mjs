/**
 * Journey timeline audit (dev-only QA tooling).
 *
 *   node qa-shots/journey-audit.mjs
 *
 * Checks the visual composition the journey brief asks for, at every viewport
 * it names:
 *
 *   - exactly one continuous spine: each row draws above + below its node, the
 *     halves meet at the row borders, and every segment shares one width and
 *     one colour
 *   - every node sits on that spine (same x for the whole journey)
 *   - a project mark beside every project title, and contextual marks for the
 *     education / internship rows
 *   - dates on one shared column, content on one shared left edge
 *   - no horizontal overflow, no console errors
 *
 * Screenshots of the section land in qa-shots/journey-<viewport>.png.
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
  [320, 568],
];

const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 47000 + Math.floor(Math.random() * 1900);
const BASE = process.env.QA_BASE || "http://localhost:3000";

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\qa-journey-${process.pid}`,
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

/* Walk the whole page first so every Reveal has finished before measuring. */
const probe = `JSON.stringify((() => {
  const round = (n) => Math.round(n * 10) / 10;
  /* Everything is recorded in page coordinates: the screenshot clip is in page
     coordinates, and the page may still be smooth-scrolling back to the top
     when this runs. */
  const sxo = window.scrollX;
  const syo = window.scrollY;
  const rows = [...document.querySelectorAll('.journey__row')];
  const container = document.querySelector('#journey .container') || document.querySelector('#journey');
  const containerBox = container.getBoundingClientRect();

  const data = rows.map((row, i) => {
    const marker = row.querySelector('.journey__marker');
    const dot = row.querySelector('.journey__dot');
    const when = row.querySelector('.journey__when');
    const body = row.querySelector('.journey__body');
    const mark = row.querySelector('.journey__mark');
    const title = row.querySelector('.journey__title');
    const item = row.querySelector('.journey__item');

    const mRect = marker.getBoundingClientRect();
    const dRect = dot.getBoundingClientRect();
    const before = getComputedStyle(marker, '::before');
    const after = getComputedStyle(marker, '::after');
    const hasBefore = before.content !== 'none' && before.content !== 'normal';
    const hasAfter = after.content !== 'none' && after.content !== 'normal';
    const dotY = dRect.top + dRect.height / 2;

    const seg = (cs, exists) => {
      if (!exists) return null;
      const top = mRect.top + parseFloat(cs.top) + syo;
      /* Chrome reports the used height for both halves, so the segment is
         simply top .. top + height regardless of which edge was declared. */
      const height = parseFloat(cs.height);
      return {
        top,
        bottom: top + height,
        width: parseFloat(cs.width),
        bg: cs.backgroundColor,
      };
    };

    return {
      i,
      title: (title?.textContent || '').trim(),
      type: (row.querySelector('.journey__tag')?.textContent || '').trim(),
      accent: item?.dataset.accent ?? null,
      latest: item?.hasAttribute('data-latest') ?? false,
      markerCentreX: round(mRect.left + mRect.width / 2 + sxo),
      markerTop: round(mRect.top + syo),
      markerBottom: round(mRect.bottom + syo),
      dotY: round(dotY + syo),
      dotSize: round(dRect.height),
      before: seg(before, hasBefore),
      after: seg(after, hasAfter),
      when: when ? { left: round(when.getBoundingClientRect().left + sxo), right: round(when.getBoundingClientRect().right + sxo), top: round(when.getBoundingClientRect().top + syo) } : null,
      body: body ? { left: round(body.getBoundingClientRect().left + sxo), right: round(body.getBoundingClientRect().right + sxo), top: round(body.getBoundingClientRect().top + syo) } : null,
      mark: mark
        ? {
            tag: mark.tagName,
            w: round(mark.getBoundingClientRect().width),
            h: round(mark.getBoundingClientRect().height),
            top: round(mark.getBoundingClientRect().top),
            visible: mark.getBoundingClientRect().width > 0,
          }
        : null,
      opacity: Number(getComputedStyle(row).opacity),
    };
  });

  const doc = document.documentElement;
  return {
    rows: data,
    containerLeft: round(containerBox.left + sxo),
    containerRight: round(containerBox.right + sxo),
    overflow: doc.scrollWidth - doc.clientWidth,
    rowOrder: data.map((r) => r.title),
  };
})())`;

let failures = 0;
console.log("\n### journey timeline audit\n");

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
  /* Hydration arms the IntersectionObserver behind every Reveal: scrolling
     before it runs means the rows never get their reveal and the audit would
     happily measure an invisible timeline. */
  await sleep(3500);
  await send(
    "Runtime.evaluate",
    {
      expression: `(async () => {
        const step = window.innerHeight * 0.5;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 260));
        }
        const j = document.getElementById('journey');
        if (j) window.scrollTo(0, j.offsetTop - 200);
        await new Promise((r) => setTimeout(r, 1000));
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 400));
        return 1;
      })()`,
      awaitPromise: true,
    },
    sessionId,
  );

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
  const rows = d.rows;
  const problems = [];

  if (rows.length !== 6) problems.push(`row count ${rows.length} (expected 6)`);
  const hidden = rows.filter((r) => r.opacity !== 1);
  if (hidden.length) problems.push(`${hidden.length} row(s) still unrevealed (opacity ${hidden[0].opacity})`);

  /* ── spine: one x, uniform segments, no missing sections ───────────── */
  const centres = new Set(rows.map((r) => r.markerCentreX));
  if (centres.size > 1) problems.push(`spine x varies: ${[...centres].join(", ")}`);

  const widths = new Set(rows.flatMap((r) => [r.before, r.after].filter(Boolean).map((s) => s.width)));
  const bgs = new Set(rows.flatMap((r) => [r.before, r.after].filter(Boolean).map((s) => s.bg)));
  if (widths.size > 1) problems.push(`spine width varies: ${[...widths].join(", ")}`);
  if (bgs.size > 1) problems.push(`spine colour varies: ${[...bgs].join(", ")}`);

  rows.forEach((r, i) => {
    const first = i === 0;
    const last = i === rows.length - 1;
    if (first && r.before) problems.push(`row 0 draws above its node`);
    if (last && r.after) problems.push(`last row draws below its node`);
    if (!first && !r.before) problems.push(`row ${i} missing segment above node`);
    if (!last && !r.after) problems.push(`row ${i} missing segment below node`);
    if (r.before && Math.abs(r.before.bottom - r.dotY) > 1.5) {
      problems.push(`row ${i} upper segment ends ${roundGap(r.before.bottom, r.dotY)}px from its node`);
    }
    if (r.after && Math.abs(r.after.top - r.dotY) > 1.5) {
      problems.push(`row ${i} lower segment starts ${roundGap(r.after.top, r.dotY)}px from its node`);
    }
    if (i > 0) {
      const prevAfter = rows[i - 1].after;
      if (prevAfter && r.before && prevAfter.bottom < r.before.top - 0.5) {
        problems.push(`gap of ${Math.round(r.before.top - prevAfter.bottom)}px between row ${i - 1} and ${i}`);
      }
    }
  });

  /* ── nodes on the spine ────────────────────────────────────────────── */
  rows.forEach((r) => {
    if (Math.abs(r.dotY - (r.before?.bottom ?? r.dotY)) > 1.5 && r.before) {
      problems.push(`row ${r.i} node off spine`);
    }
  });

  /* ── marks ─────────────────────────────────────────────────────────── */
  const expected = ["ARIV", "SodhaneGPT", "Info-i (VeriTrust Agent)", "Hazard Det"];
  rows.forEach((r) => {
    if (!r.mark || !r.mark.visible) {
      problems.push(`row ${r.i} (${r.title.slice(0, 20)}) has no mark`);
      return;
    }
    if (r.mark.w < 24 || r.mark.h < 24) problems.push(`row ${r.i} mark ${r.mark.w}x${r.mark.h} too small`);
    if (r.mark.w > 34 || r.mark.h > 34) problems.push(`row ${r.i} mark ${r.mark.w}x${r.mark.h} too large`);
  });
  for (const title of expected) {
    const row = rows.find((r) => r.title === title);
    if (!row) problems.push(`missing row ${title}`);
    else if ((row.mark?.tag ?? "").toLowerCase() !== "svg") problems.push(`${title} has no svg project mark`);
  }
  if (!rows[0] || rows[0].title !== "ARIV") problems.push(`newest row is ${rows[0]?.title}, expected ARIV`);
  else if (!rows[0].latest) problems.push("ARIV row is not flagged data-latest");

  /* ── columns ───────────────────────────────────────────────────────── */
  const mobile = W <= 780;
  const dateKey = mobile ? "left" : "right";
  const dateSpread = spread(rows.map((r) => r.when?.[dateKey]));
  const bodySpread = spread(rows.map((r) => r.body?.left));
  if (dateSpread > 1) problems.push(`dates not on one column (${dateKey} spread ${dateSpread}px)`);
  if (bodySpread > 1) problems.push(`content left edges spread ${bodySpread}px`);
  const bodyRight = Math.max(...rows.map((r) => r.body?.right ?? 0));
  if (bodyRight > d.containerRight + 1) problems.push(`content overflows container by ${Math.round(bodyRight - d.containerRight)}px`);
  if (d.overflow > 1) problems.push(`horizontal overflow ${d.overflow}px`);

  for (const e of errors) problems.push(`console: ${String(e).slice(0, 140)}`);

  /* ── screenshot of the section ─────────────────────────────────────── */
  const geo = await send(
    "Runtime.evaluate",
    {
      expression: `(() => { const r = document.getElementById('journey').getBoundingClientRect(); return JSON.stringify({ x: Math.max(0, r.left + scrollX), y: r.top + scrollY, w: r.width, h: r.height }); })()`,
      returnByValue: true,
    },
    sessionId,
  );
  const g = JSON.parse(geo.result.value);
  const shot = await send(
    "Page.captureScreenshot",
    {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: g.x, y: g.y, width: g.w, height: Math.min(g.h, 4000), scale: 1 },
    },
    sessionId,
  );
  writeFileSync(`qa-shots/journey-${W}x${H}.png`, Buffer.from(shot.data, "base64"));

  /* ── pixel check: is the spine actually painted, end to end? ──────── */
  await send(
    "Runtime.evaluate",
    { expression: `window.__b64 = ${JSON.stringify(shot.data)}` },
    sessionId,
  );
  const first = rows[0];
  const last = rows[rows.length - 1];
  const pixel = await send(
    "Runtime.evaluate",
    {
      expression: `(async () => {
        const img = new Image(); img.src = 'data:image/png;base64,' + window.__b64; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
        const sx = Math.round(${rows[1].markerCentreX} - ${g.x});
        const y0 = Math.round(${first.dotY} - ${g.y});
        const y1 = Math.round(${last.dotY} - ${g.y});
        const refX = Math.min(img.width - 2, sx + 10);
        const px = (x, y) => { const d = ctx.getImageData(x, y, 1, 1).data; return [d[0], d[1], d[2]]; };
        const dist = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
        let painted = 0, total = 0; const gaps = []; let run = null;
        for (let y = y0; y <= y1; y++) {
          const on = dist(px(sx, y), px(refX, y)) > 10 || dist(px(sx + 1, y), px(refX, y)) > 10;
          total++;
          if (on) { painted++; if (run) { gaps.push(run); run = null; } }
          else { if (!run) run = { from: y, to: y }; else run.to = y; }
        }
        if (run) gaps.push(run);
        return JSON.stringify({ sx, y0, y1, painted, total, gaps });
      })()`,
      returnByValue: true,
      awaitPromise: true,
    },
    sessionId,
  );
  const px = JSON.parse(pixel.result.value);
  if (px.gaps.length) {
    problems.push(`spine unpainted for ${px.gaps.length} run(s): ${JSON.stringify(px.gaps.slice(0, 3))}`);
  }

  if (problems.length) {
    failures++;
    console.log(`FAIL ${W}x${H}`);
    for (const p of problems) console.log(`       - ${p}`);
  } else {
    const markSizes = [...new Set(rows.map((r) => `${r.mark.w}px`))].join("/");
    console.log(
      `ok   ${W}x${H}  ${rows.length} rows, spine x=${rows[0].markerCentreX} (${widths.size ? [...widths].join("") : "?"}px, ${[...bgs][0]}), ` +
        `marks ${markSizes}, dates ${dateSpread}px, body ${bodySpread}px, overflow ${d.overflow}`,
    );
  }
}

function spread(values) {
  const nums = values.filter((v) => typeof v === "number");
  return Math.round((Math.max(...nums) - Math.min(...nums)) * 10) / 10;
}
function roundGap(a, b) {
  return Math.round(Math.abs(a - b) * 10) / 10;
}

console.log(`\n${failures === 0 ? "JOURNEY CLEAN AT ALL VIEWPORTS" : `${failures} viewport(s) failed`}`);
ws.close();
try {
  spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore" });
} catch {}
process.exit(failures === 0 ? 0 : 1);
