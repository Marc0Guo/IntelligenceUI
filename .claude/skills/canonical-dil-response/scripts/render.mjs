import { readFileSync } from "node:fs";

const documentMode = process.argv.includes("--document");
const fileArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
const raw = fileArg ? readFileSync(fileArg, "utf8") : readFileSync(0, "utf8");

let input;
try {
  input = JSON.parse(raw);
} catch {
  console.error("Document JSON could not be parsed.");
  process.exit(1);
}

const blocks = input.blocks ?? input.document?.blocks;
if (!Array.isArray(blocks)) {
  console.error("Document needs a blocks array.");
  process.exit(1);
}

const rootId = `dil-${Math.random().toString(36).slice(2, 8)}`;
let serial = 0;
const nextId = (prefix) => `${rootId}-${prefix}-${serial++}`;

const GCS = {
  title: "Glasgow Coma Scale",
  subtitle: "Eye, verbal, and motor responses.",
  score_label: "GCS",
  score_range_label: "3-15",
  inputs: [
    { key: "eye", label: "Eye opening", options: [["4", "4 — Spontaneous"], ["3", "3 — To sound"], ["2", "2 — To pressure"], ["1", "1 — None"]] },
    { key: "verbal", label: "Best verbal", options: [["5", "5 — Oriented"], ["4", "4 — Confused"], ["3", "3 — Words"], ["2", "2 — Sounds"], ["1", "1 — None"]] },
    { key: "motor", label: "Best motor", options: [["6", "6 — Obeys commands"], ["5", "5 — Localizes"], ["4", "4 — Withdraws"], ["3", "3 — Abnormal flexion"], ["2", "2 — Extension"], ["1", "1 — None"]] },
  ],
  values: { eye: "3", verbal: "4", motor: "5" },
};

const GBS = {
  title: "Glasgow-Blatchford score",
  subtitle: "Upper gastrointestinal bleeding.",
  score_label: "GBS",
  score_range_label: "0-23",
  inputs: [
    { key: "sex", label: "Sex", options: [["male", "Male"], ["female", "Female"]] },
    { key: "bun", label: "BUN", suffix: "mg/dL" },
    { key: "hemoglobin", label: "Hemoglobin", suffix: "g/dL" },
    { key: "sbp", label: "Systolic blood pressure", suffix: "mmHg" },
    { key: "pulse", label: "Pulse", suffix: "bpm" },
    { key: "melena", label: "Melena", options: [["0", "No"], ["1", "Yes"]] },
    { key: "syncope", label: "Syncope", options: [["0", "No"], ["1", "Yes"]] },
    { key: "hepatic_disease", label: "Hepatic disease", options: [["0", "No"], ["1", "Yes"]] },
    { key: "cardiac_failure", label: "Cardiac failure", options: [["0", "No"], ["1", "Yes"]] },
  ],
  values: { sex: "male", bun: "22", hemoglobin: "12.5", sbp: "118", pulse: "88", melena: "0", syncope: "0", hepatic_disease: "0", cardiac_failure: "0" },
};

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function payload(block) {
  return block.__state ?? block.state ?? block;
}

function httpUrl(value) {
  return /^https?:\/\//i.test(String(value ?? ""));
}

function dataImage(value) {
  return String(value ?? "").startsWith("data:image/");
}

function action(label, url) {
  if (documentMode && httpUrl(url)) {
    return `<a class="btn" href="${esc(url)}">${esc(label)}</a>`;
  }
  return `<button type="button" class="btn">${esc(label)}</button>`;
}

function image(url, className) {
  if (dataImage(url) || (documentMode && httpUrl(url))) {
    return `<img class="${className}" alt="" src="${esc(url)}"/>`;
  }
  return "";
}

function card(kind, inner) {
  return `<section class="card" data-d-component="${esc(kind)}">${inner}</section>`;
}

function applyLabel(source) {
  return { linkedin: "Apply on LinkedIn", indeed: "Apply on Indeed", upwork: "Apply on Upwork", ziprecruiter: "Apply on ZipRecruiter" }[source] ?? "Apply";
}

function scoreGcs(values) {
  const score = ["eye", "verbal", "motor"].reduce((total, key) => total + Number(values[key] || 0), 0);
  if (score >= 13) return { display: String(score), band: "Mild brain injury range", detail: "GCS 13-15: mild impairment range.", tone: "ok" };
  if (score >= 9) return { display: String(score), band: "Moderate brain injury range", detail: "GCS 9-12: moderate impairment range.", tone: "warn" };
  return { display: String(score), band: "Severe brain injury range", detail: "GCS 3-8: severe impairment range, often prompting airway and critical-care considerations.", tone: "danger" };
}

function scoreGbs(values) {
  if ([values.bun, values.hemoglobin, values.sbp, values.pulse].some((value) => value === "" || value == null)) {
    return { display: "-", band: "Incomplete", detail: "Enter sex, BUN, hemoglobin, systolic blood pressure, and pulse to finish the GBS.", tone: "muted" };
  }
  const bun = Number(values.bun);
  const hgb = Number(values.hemoglobin);
  const sbp = Number(values.sbp);
  const score = Math.trunc(
    (bun >= 70 ? 6 : bun >= 28 ? 4 : bun >= 22.4 ? 3 : bun >= 18.2 ? 2 : 0) +
      (values.sex === "male" ? (hgb < 10 ? 6 : hgb < 12 ? 3 : hgb < 13 ? 1 : 0) : hgb < 10 ? 6 : hgb < 12 ? 1 : 0) +
      (sbp < 90 ? 3 : sbp < 100 ? 2 : sbp < 110 ? 1 : 0) +
      (Number(values.pulse) >= 100 ? 1 : 0) +
      Number(values.melena) +
      2 * Number(values.syncope) +
      2 * Number(values.hepatic_disease) +
      2 * Number(values.cardiac_failure),
  );
  if (score === 0) return { display: "0", band: "Very low-risk bleed", detail: "A Glasgow-Blatchford score of 0 identifies very low-risk patients who may be candidates for outpatient management.", tone: "ok" };
  if (score <= 5) return { display: String(score), band: "Higher-risk bleed", detail: "Nonzero GBS suggests the need for hospital-based evaluation and likely endoscopy.", tone: "warn" };
  return { display: String(score), band: "High-risk bleed", detail: "Higher GBS values suggest substantial need for intervention and closer monitoring.", tone: "danger" };
}

function clinical(kind, shell, scoreFn, block) {
  const incoming = payload(block);
  const state = {
    ...shell,
    ...incoming,
    values: { ...shell.values, ...(incoming.values ?? {}) },
  };
  const score = scoreFn(state.values);
  const id = nextId("clin");
  const fields = state.inputs.map((input) => {
    const value = state.values[input.key] ?? "";
    const pairs = optionPairs(input);
    const control = pairs.length
      ? `<select data-key="${esc(input.key)}">${pairs.map(([option, label]) => `<option value="${esc(option)}"${String(option) === String(value) ? " selected" : ""}>${esc(label)}</option>`).join("")}</select>`
      : `<input data-key="${esc(input.key)}" inputmode="decimal" value="${esc(value)}" aria-label="${esc(input.label)}"/>`;
    const suffix = input.suffix ? `<span class="suffix">${esc(input.suffix)}</span>` : "";
    return `<label class="field"><span>${esc(input.label)}</span>${control}${suffix}</label>`;
  }).join("");
  return card(kind, `
    <p class="kicker">Clinical risk calculator</p>
    <h3>${esc(state.title)}</h3>
    <p class="muted">${esc(state.subtitle)}</p>
    <div class="score" data-kind="clinical" data-scorer="${kind.startsWith("CalculatorGlasgowComa") ? "gcs" : "gbs"}" id="${id}">
      <p class="score-num" data-display>${esc(score.display)}</p>
      <p class="muted">${esc(state.score_label)} ${esc(state.score_range_label)}</p>
      <p class="band tone-${score.tone}" data-band>${esc(score.band)}</p>
      <p class="muted" data-detail>${esc(score.detail)}</p>
    </div>
    <div class="fields">${fields}</div>`);
}

function optionPairs(input) {
  return (input.options ?? []).map((option) => (Array.isArray(option) ? option : [option.value, option.label]));
}

function view(block) {
  const state = payload(block);
  return state === block ? block : { ...block, ...state };
}

function render(block) {
  block = view(block);
  const type = block.type;
  const state = payload(block);
  if (type === "text") return `<p class="lead">${esc(state.text ?? block.text)}</p>`;
  if (type === "row") return `<div class="row">${(block.children ?? []).map(render).join("")}</div>`;
  if (type === "jobs" || type === "JobsWidget") return renderJob(state);
  if (type === "NewsArticleWidget") return renderNews([state]);
  if (type === "news" || type === "NewsArticleWidgetCarousel") return renderNews(state.items ?? [state]);
  if (type === "CalculatorGlasgowComaScaleGcsWidget") return clinical(type, GCS, scoreGcs, block);
  if (type === "CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget") return clinical(type, GBS, scoreGbs, block);
  if (type === "weather") return renderWeather(block);
  if (type === "clock") return renderClock(block);
  if (type === "schedule") return renderSchedule(block);
  if (type === "location") return card("location", `<h3>${esc(block.name)}</h3><p class="muted">${esc(block.area)}</p><p>${esc(block.note)}</p>`);
  if (type === "stock") return card("stock", `<p class="kicker">${esc(block.symbol)}</p><h3>${esc(block.name)}</h3><p class="temp">${esc(block.price)}</p><p class="muted">${esc(block.change)}</p>`);
  if (type === "currency") {
    const converted = Math.round(Number(block.amount) * Number(block.rate) * 100) / 100;
    return card("currency", `<h3>${esc(block.amount)} ${esc(block.from)}</h3><p class="temp">${esc(converted)} ${esc(block.to)}</p><p class="muted">Rate ${esc(block.rate)}</p>`);
  }
  if (type === "pie") return renderPie(block);
  if (type === "quiz") return renderQuiz(block);
  if (type === "flashcard") return `<button type="button" class="card flash" data-kind="flash" data-front="${esc(block.front)}" data-back="${esc(block.back)}"><span data-face>${esc(block.front)}</span><small class="muted">Tap to flip</small></button>`;
  if (type === "calculator") return renderCalculator(block);
  if (type === "followups") return `<div class="follow">${(block.items ?? []).map((item) => `<button type="button">${esc(item)}</button>`).join("")}</div>`;
  throw new Error(`Unsupported block type: ${type}`);
}

function renderJob(state) {
  const bits = [state.location, state.salary, state.employment_type].filter(Boolean).map((value) => `<span>${esc(value)}</span>`).join("");
  return card("JobsWidget", `
    <div class="job-head">
      <div>${image(state.company_logo_url, "logo")}<p class="kicker">${esc(state.company)}</p><h3>${esc(state.title)}</h3></div>
      ${action(applyLabel(state.source), state.apply_url_with_tracking)}
    </div>
    <p class="meta">${bits}</p>
    ${state.role_summary ? `<p>${esc(state.role_summary)}</p>` : ""}`);
}

function renderNews(items) {
  const cards = items.map((item) => {
    const body = `<p class="kicker">${esc(item.source_label ?? item.source)}</p><h3>${esc(item.title)}</h3><p class="muted">${esc(item.date_label ?? item.date)}</p><p>${esc(item.snippet)}</p>`;
    return documentMode && httpUrl(item.url)
      ? `<a class="card news" href="${esc(item.url)}">${body}</a>`
      : `<article class="card news">${body}</article>`;
  }).join("");
  return `<div class="news">${cards}</div>`;
}

function renderWeather(block) {
  const hours = block.hours ?? [];
  const selected = Math.min(2, Math.max(0, hours.length - 1));
  const max = Math.max(...hours.map((item) => Number(item.f) || 0), 1);
  const buttons = hours.map((item, index) => `
    <button type="button" data-hour="${index}" data-c="${esc(item.c)}" data-f="${esc(item.f)}" aria-pressed="${index === selected ? "true" : "false"}">
      <span>${esc(item.label)}</span>
      <span class="track"><span class="bar" style="height:${Math.round(((Number(item.f) || 0) / max) * 100)}%"></span></span>
      <span data-value>${esc(item.f)}°</span>
    </button>`).join("");
  const current = hours[selected];
  return card("weather", `
    <div data-kind="weather" data-c="${esc(block.tempC)}" data-f="${esc(block.tempF)}">
      <p class="kicker">${esc(block.city)}</p>
      <h3>${esc(block.condition)}</h3>
      <div class="split"><p class="temp" data-temp>${esc(block.tempF)}°F</p>
        <div class="seg" role="group" aria-label="Temperature unit">
          <button type="button" data-unit="f" aria-pressed="true">°F</button>
          <button type="button" data-unit="c" aria-pressed="false">°C</button>
        </div>
      </div>
      <p class="muted">${esc(block.summary)}</p>
      <div class="hours">${buttons}</div>
      <p class="muted" data-selected>${current ? `${esc(current.label)}: ${esc(current.f)}°` : ""}</p>
    </div>`);
}

function renderClock(block) {
  const offset = Number(block.offsetHours ?? 0);
  const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
  const there = new Date(utc + offset * 3600000);
  const label = there.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return card("clock", `<p class="kicker">${esc(block.place)}</p><p class="temp" data-kind="clock" data-offset="${esc(offset)}">${esc(label)}</p>`);
}

function renderSchedule(block) {
  const items = (block.items ?? []).map((item) => `<li><span>${esc(item.time)}</span><span><strong>${esc(item.title)}</strong><br/><span class="muted">${esc(item.detail ?? "")}</span></span></li>`).join("");
  return card("schedule", `<h3>${esc(block.title)}</h3><ul class="schedule">${items}</ul>`);
}

function renderPie(block) {
  const slices = block.slices ?? [];
  const total = slices.reduce((sum, slice) => sum + Number(slice.value || 0), 0) || 1;
  const colors = ["#2451da", "#6d8fe8", "#a9c0f4", "#d5e1fb"];
  const tone = (slice, index) => (/^#[0-9a-fA-F]{3,8}$/.test(slice.color ?? "") ? slice.color : colors[index % colors.length]);
  let cursor = 0;
  const stops = slices.map((slice, index) => {
    const start = cursor;
    cursor += (Number(slice.value) / total) * 100;
    return `${tone(slice, index)} ${start}% ${cursor}%`;
  }).join(", ");
  const legend = slices.map((slice, index) => `<li><i style="background:${tone(slice, index)}"></i>${esc(slice.label)} ${esc(slice.value)}</li>`).join("");
  return card("pie", `<h3>${esc(block.title)}</h3><div class="pie" style="background:conic-gradient(${stops})" role="img" aria-label="${esc(block.title)}"></div><ul class="legend">${legend}</ul>`);
}

function renderQuiz(block) {
  const questions = (block.questions ?? []).map((question) => {
    const choices = (question.choices ?? []).map((choice, index) => `<button type="button" data-choice="${index}" data-answer="${esc(question.answer)}">${esc(choice)}</button>`).join("");
    return `<div data-kind="quiz"><p>${esc(question.prompt)}</p><div class="choices">${choices}</div><p class="muted" data-result hidden></p></div>`;
  }).join("");
  return card("quiz", questions);
}

function renderCalculator(block) {
  const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "C", "+", "="];
  return card("calculator", `
    <h3>${esc(block.title)}</h3>
    <p class="temp" data-kind="calculator" data-readout>${esc(block.start ?? "0")}</p>
    <div class="keys">${keys.map((key) => `<button type="button" data-key="${esc(key)}">${esc(key)}</button>`).join("")}</div>`);
}

const css = `
#${rootId} { display: flex; flex-direction: column; gap: 12px; color: light-dark(#0d0d0d, #ececec); font-family: "Segoe UI", sans-serif; }
#${rootId} * { box-sizing: border-box; }
#${rootId} .card { background: light-dark(#fff, #212121); border: 1px solid light-dark(rgba(13,13,13,.08), rgba(255,255,255,.12)); border-radius: 20px; padding: 16px; }
#${rootId} h3 { margin: 0 0 8px; font-size: 18px; font-weight: 600; }
#${rootId} .kicker, #${rootId} .muted { color: light-dark(#5d5d5d, #a0a0ab); font-size: 13px; margin: 0; }
#${rootId} .lead { margin: 0; }
#${rootId} .temp { margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.04em; }
#${rootId} .split, #${rootId} .job-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
#${rootId} .btn, #${rootId} .seg button, #${rootId} .keys button, #${rootId} .choices button, #${rootId} .follow button, #${rootId} .hours button, #${rootId} select, #${rootId} input {
  font: inherit; color: inherit;
}
#${rootId} .btn { border: 0; border-radius: 999px; padding: 8px 12px; background: light-dark(#0d0d0d, #ececec); color: light-dark(#fff, #111); text-decoration: none; white-space: nowrap; }
#${rootId} .seg { display: flex; padding: 2px; border-radius: 999px; background: light-dark(#f3f3f3, #2a2a2a); }
#${rootId} .seg button, #${rootId} .hours button, #${rootId} .choices button, #${rootId} .keys button, #${rootId} .follow button { border: 0; background: transparent; }
#${rootId} .seg button { border-radius: 999px; padding: 4px 10px; }
#${rootId} .seg button[aria-pressed="true"] { background: light-dark(#fff, #3a3a3a); }
#${rootId} .hours { display: grid; grid-template-columns: repeat(auto-fit, minmax(48px, 1fr)); gap: 6px; margin-top: 12px; }
#${rootId} .hours button { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 12px; color: light-dark(#5d5d5d, #a0a0ab); }
#${rootId} .hours button[aria-pressed="true"] { color: inherit; font-weight: 600; }
#${rootId} .track { width: 8px; height: 56px; border-radius: 99px; background: light-dark(#f3f3f3, #2a2a2a); display: flex; align-items: flex-end; overflow: hidden; }
#${rootId} .bar { width: 100%; background: #2451da; border-radius: 99px; }
#${rootId} .meta, #${rootId} .schedule { display: flex; flex-wrap: wrap; gap: 10px; }
#${rootId} .schedule { list-style: none; margin: 0; padding: 0; flex-direction: column; }
#${rootId} .schedule li { display: grid; grid-template-columns: 64px 1fr; gap: 8px; }
#${rootId} .logo { width: 20px; height: 20px; object-fit: contain; }
#${rootId} .news { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
#${rootId} .news .card { color: inherit; text-decoration: none; }
#${rootId} .row { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 12px; }
#${rootId} .fields { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
#${rootId} .field { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; }
#${rootId} select, #${rootId} input { border: 1px solid light-dark(rgba(13,13,13,.12), rgba(255,255,255,.16)); background: transparent; border-radius: 8px; padding: 6px 8px; }
#${rootId} .score { margin: 12px 0; }
#${rootId} .score-num { margin: 0; font-size: 40px; font-weight: 600; }
#${rootId} .tone-ok { color: #027c6a; }
#${rootId} .tone-warn { color: #9a6700; }
#${rootId} .tone-danger { color: #b42318; }
#${rootId} .pie { width: 96px; height: 96px; border-radius: 50%; }
#${rootId} .legend { list-style: none; margin: 8px 0 0; padding: 0; }
#${rootId} .legend li { display: flex; gap: 8px; align-items: center; }
#${rootId} .legend i { width: 8px; height: 8px; border-radius: 99px; display: inline-block; }
#${rootId} .keys, #${rootId} .choices, #${rootId} .follow { display: flex; flex-wrap: wrap; gap: 6px; }
#${rootId} .keys { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
#${rootId} .keys button, #${rootId} .choices button, #${rootId} .follow button { border-radius: 10px; padding: 8px; background: light-dark(#f3f3f3, #2a2a2a); }
@media (max-width: 560px) { #${rootId} .row { grid-template-columns: 1fr; } }
`.trim();

const behavior = `
(function () {
  var root = document.getElementById(${JSON.stringify(rootId)});
  if (!root) return;
  root.querySelectorAll("[data-kind='weather']").forEach(function (box) {
    var unit = "f";
    var selected = 0;
    box.querySelectorAll("[data-hour]").forEach(function (button, index) {
      if (button.getAttribute("aria-pressed") === "true") selected = index;
    });
    function paint() {
      var temp = box.getAttribute("data-" + unit);
      box.querySelector("[data-temp]").textContent = temp + "°" + unit.toUpperCase();
      var max = 0;
      box.querySelectorAll("[data-hour]").forEach(function (button) {
        max = Math.max(max, Number(button.getAttribute("data-" + unit)) || 0);
      });
      box.querySelectorAll("[data-hour]").forEach(function (button, index) {
        var value = Number(button.getAttribute("data-" + unit)) || 0;
        button.setAttribute("aria-pressed", index === selected ? "true" : "false");
        button.querySelector("[data-value]").textContent = value + "°";
        button.querySelector(".bar").style.height = Math.round((value / (max || 1)) * 100) + "%";
      });
      var current = box.querySelectorAll("[data-hour]")[selected];
      if (current) box.querySelector("[data-selected]").textContent = current.querySelector("span").textContent + ": " + current.getAttribute("data-" + unit) + "°";
      box.querySelectorAll("[data-unit]").forEach(function (button) {
        button.setAttribute("aria-pressed", button.getAttribute("data-unit") === unit ? "true" : "false");
      });
    }
    box.querySelectorAll("[data-unit]").forEach(function (button) {
      button.addEventListener("click", function () { unit = button.getAttribute("data-unit"); paint(); });
    });
    box.querySelectorAll("[data-hour]").forEach(function (button, index) {
      button.addEventListener("click", function () { selected = index; paint(); });
    });
  });
  function gcs(values) {
    var score = Number(values.eye || 0) + Number(values.verbal || 0) + Number(values.motor || 0);
    if (score >= 13) return [String(score), "Mild brain injury range", "GCS 13-15: mild impairment range.", "ok"];
    if (score >= 9) return [String(score), "Moderate brain injury range", "GCS 9-12: moderate impairment range.", "warn"];
    return [String(score), "Severe brain injury range", "GCS 3-8: severe impairment range, often prompting airway and critical-care considerations.", "danger"];
  }
  function gbs(values) {
    if (values.bun === "" || values.hemoglobin === "" || values.sbp === "" || values.pulse === "") {
      return ["-", "Incomplete", "Enter sex, BUN, hemoglobin, systolic blood pressure, and pulse to finish the GBS.", "muted"];
    }
    var bun = Number(values.bun), hgb = Number(values.hemoglobin), sbp = Number(values.sbp);
    var score = Math.trunc((bun >= 70 ? 6 : bun >= 28 ? 4 : bun >= 22.4 ? 3 : bun >= 18.2 ? 2 : 0) + (values.sex === "male" ? (hgb < 10 ? 6 : hgb < 12 ? 3 : hgb < 13 ? 1 : 0) : (hgb < 10 ? 6 : hgb < 12 ? 1 : 0)) + (sbp < 90 ? 3 : sbp < 100 ? 2 : sbp < 110 ? 1 : 0) + (Number(values.pulse) >= 100 ? 1 : 0) + Number(values.melena) + 2 * Number(values.syncope) + 2 * Number(values.hepatic_disease) + 2 * Number(values.cardiac_failure));
    if (score === 0) return ["0", "Very low-risk bleed", "A Glasgow-Blatchford score of 0 identifies very low-risk patients who may be candidates for outpatient management.", "ok"];
    if (score <= 5) return [String(score), "Higher-risk bleed", "Nonzero GBS suggests the need for hospital-based evaluation and likely endoscopy.", "warn"];
    return [String(score), "High-risk bleed", "Higher GBS values suggest substantial need for intervention and closer monitoring.", "danger"];
  }
  root.querySelectorAll("[data-kind='clinical']").forEach(function (box) {
    function read() {
      var values = {};
      box.parentElement.querySelectorAll("[data-key]").forEach(function (control) { values[control.getAttribute("data-key")] = control.value; });
      return values;
    }
    function paint() {
      var result = (box.getAttribute("data-scorer") === "gcs" ? gcs : gbs)(read());
      box.querySelector("[data-display]").textContent = result[0];
      var band = box.querySelector("[data-band]");
      band.textContent = result[1];
      band.className = "band tone-" + result[3];
      box.querySelector("[data-detail]").textContent = result[2];
    }
    box.parentElement.querySelectorAll("[data-key]").forEach(function (control) { control.addEventListener("input", paint); control.addEventListener("change", paint); });
  });
  root.querySelectorAll("[data-kind='quiz']").forEach(function (box) {
    box.querySelectorAll("[data-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        var result = box.querySelector("[data-result]");
        var correct = button.getAttribute("data-choice") === button.getAttribute("data-answer");
        result.hidden = false;
        result.textContent = correct ? "Correct." : "Try another choice.";
      });
    });
  });
  root.querySelectorAll("[data-kind='flash']").forEach(function (button) {
    button.addEventListener("click", function () {
      var face = button.querySelector("[data-face]");
      var showing = face.textContent === button.getAttribute("data-front") ? "back" : "front";
      face.textContent = button.getAttribute("data-" + showing);
      button.querySelector("small").textContent = showing === "back" ? "Answer" : "Tap to flip";
    });
  });
  root.querySelectorAll("[data-kind='calculator']").forEach(function (readout) {
    function solve(expr) {
      if (!/^[0-9+\\-*/().\\s]+$/.test(expr)) return "Error";
      var tokens = expr.match(/\\d*\\.\\d+|\\d+|[+\\-*/()]/g) || [];
      var output = [], ops = [], rank = { "+": 1, "-": 1, "*": 2, "/": 2 };
      function collapse() { var op = ops.pop(), b = output.pop(), a = output.pop(); output.push(op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b); }
      tokens.forEach(function (token) {
        if (/\\d/.test(token)) output.push(Number(token));
        else if (token === "(") ops.push(token);
        else if (token === ")") { while (ops.length && ops[ops.length - 1] !== "(") collapse(); ops.pop(); }
        else { while (ops.length && rank[ops[ops.length - 1]] >= rank[token]) collapse(); ops.push(token); }
      });
      while (ops.length) collapse();
      return output.length === 1 && Number.isFinite(output[0]) ? String(output[0]) : "Error";
    }
    readout.parentElement.querySelectorAll("[data-key]").forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-key");
        var current = readout.textContent;
        if (key === "C") readout.textContent = "0";
        else if (key === "=") readout.textContent = solve(current);
        else readout.textContent = current === "0" || current === "Error" ? key : current + key;
      });
    });
  });
  function paintClock() {
    root.querySelectorAll("[data-kind='clock']").forEach(function (node) {
      var offset = Number(node.getAttribute("data-offset")) || 0;
      var there = new Date(Date.now() + (new Date().getTimezoneOffset() * 60000) + offset * 3600000);
      node.textContent = there.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    });
  }
  paintClock();
  setInterval(paintClock, 1000);
})();
`.trim();

let body;
try {
  body = blocks.map(render).join("");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const fragment = `<div id="${rootId}">\n${body}\n</div>\n<style>\n${css}\n</style>\n<script>\n${behavior}\n</script>\n`;
const page = `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>\n<body>\n${fragment}</body>\n</html>\n`;
process.stdout.write(documentMode ? page : fragment);
