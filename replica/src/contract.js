const PASSTHROUGH = new Set([
  "text",
  "row",
  "weather",
  "clock",
  "schedule",
  "location",
  "stock",
  "currency",
  "pie",
  "quiz",
  "flashcard",
  "calculator",
  "followups",
]);

export const CANONICAL = {
  JobsWidget: "JobsWidget",
  NewsArticleWidget: "NewsArticleWidget",
  NewsArticleWidgetCarousel: "NewsArticleWidgetCarousel",
  CalculatorGlasgowComaScaleGcsWidget: "CalculatorGlasgowComaScaleGcsWidget",
  CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget:
    "CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget",
};

const ALIAS = {
  jobs: CANONICAL.JobsWidget,
  JobsWidget: CANONICAL.JobsWidget,
  news: CANONICAL.NewsArticleWidgetCarousel,
  NewsArticleWidget: CANONICAL.NewsArticleWidget,
  NewsArticleWidgetCarousel: CANONICAL.NewsArticleWidgetCarousel,
  CalculatorGlasgowComaScaleGcsWidget: CANONICAL.CalculatorGlasgowComaScaleGcsWidget,
  CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget:
    CANONICAL.CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget,
};

const CLINICAL = {
  [CANONICAL.CalculatorGlasgowComaScaleGcsWidget]: {
    scorer: "gcs",
    state: {
      title: "Glasgow Coma Scale",
      subtitle: "Eye, verbal, and motor responses.",
      score_label: "GCS",
      score_range_label: "3-15",
      result_title: "Interpretation",
      summary_prefix: "GCS",
      active_info_section: "use",
      info_sections: [
        { key: "use", label: "How to use", body: "Score the best response in each category. The total is their sum." },
        { key: "range", label: "Range", body: "13-15 mild, 9-12 moderate, 3-8 severe." },
      ],
      inputs: [
        {
          key: "eye",
          label: "Eye opening",
          options: [
            { value: "4", label: "4 — Spontaneous" },
            { value: "3", label: "3 — To sound" },
            { value: "2", label: "2 — To pressure" },
            { value: "1", label: "1 — None" },
          ],
        },
        {
          key: "verbal",
          label: "Best verbal",
          options: [
            { value: "5", label: "5 — Oriented" },
            { value: "4", label: "4 — Confused" },
            { value: "3", label: "3 — Words" },
            { value: "2", label: "2 — Sounds" },
            { value: "1", label: "1 — None" },
          ],
        },
        {
          key: "motor",
          label: "Best motor",
          options: [
            { value: "6", label: "6 — Obeys commands" },
            { value: "5", label: "5 — Localizes" },
            { value: "4", label: "4 — Withdraws" },
            { value: "3", label: "3 — Abnormal flexion" },
            { value: "2", label: "2 — Extension" },
            { value: "1", label: "1 — None" },
          ],
        },
      ],
      values: { eye: "3", verbal: "4", motor: "5" },
      defaults: { eye: "3", verbal: "4", motor: "5" },
      notes: ["Educational replica of the client scorer. Not a medical device."],
    },
  },
  [CANONICAL.CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget]: {
    scorer: "gbs",
    state: {
      title: "Glasgow-Blatchford score",
      subtitle: "Upper gastrointestinal bleeding.",
      score_label: "GBS",
      score_range_label: "0-23",
      result_title: "Interpretation",
      summary_prefix: "GBS",
      active_info_section: "use",
      info_sections: [
        { key: "use", label: "How to use", body: "Leave a required field blank and the score stays incomplete." },
        { key: "range", label: "Range", body: "0 is very low risk. 1-5 is the higher-risk band. Above 5 is high risk." },
      ],
      inputs: [
        {
          key: "sex",
          label: "Sex",
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ],
        },
        { key: "bun", label: "BUN", suffix: "mg/dL", input_type: "decimal" },
        { key: "hemoglobin", label: "Hemoglobin", suffix: "g/dL", input_type: "decimal" },
        { key: "sbp", label: "Systolic blood pressure", suffix: "mmHg", input_type: "decimal" },
        { key: "pulse", label: "Pulse", suffix: "bpm", input_type: "decimal" },
        {
          key: "melena",
          label: "Melena",
          options: [
            { value: "0", label: "No" },
            { value: "1", label: "Yes" },
          ],
        },
        {
          key: "syncope",
          label: "Syncope",
          options: [
            { value: "0", label: "No" },
            { value: "1", label: "Yes" },
          ],
        },
        {
          key: "hepatic_disease",
          label: "Hepatic disease",
          options: [
            { value: "0", label: "No" },
            { value: "1", label: "Yes" },
          ],
        },
        {
          key: "cardiac_failure",
          label: "Cardiac failure",
          options: [
            { value: "0", label: "No" },
            { value: "1", label: "Yes" },
          ],
        },
      ],
      values: {
        sex: "male",
        bun: "22",
        hemoglobin: "12.5",
        sbp: "118",
        pulse: "88",
        melena: "0",
        syncope: "0",
        hepatic_disease: "0",
        cardiac_failure: "0",
      },
      defaults: {
        sex: "male",
        bun: "22",
        hemoglobin: "12.5",
        sbp: "118",
        pulse: "88",
        melena: "0",
        syncope: "0",
        hepatic_disease: "0",
        cardiac_failure: "0",
      },
      notes: ["Same point rules as the client scorer. Not for clinical use."],
    },
  },
};

export const schema = {
  complete: "POST /api/complete",
  inbox: "POST /api/inbox",
  inboxRead: "GET /api/inbox?after=0",
  inspect: "GET /api/schema",
  request: {
    prompt: "string, optional. A chat prompt, or a JSON document pasted as text.",
    document: "DilDocument, optional. Same object an LLM would emit.",
  },
  response: { document: "DilDocument" },
  DilDocument: {
    metadata: { model_dil_v2: true },
    blocks: "Block[]",
  },
  canonical: {
    JobsWidget: {
      __state: [
        "company",
        "company_logo_url",
        "title",
        "location",
        "salary",
        "employment_type",
        "role_summary",
        "source",
        "apply_url_with_tracking",
      ],
    },
    NewsArticleWidget: {
      __state: ["ref", "url", "domain", "source_label", "title", "thumbnail_url", "date_label", "snippet"],
    },
    NewsArticleWidgetCarousel: {
      __state: { items: "NewsArticleWidget state[]" },
    },
    CalculatorGlasgowComaScaleGcsWidget: {
      __state: "Optional. Omitted fields use the client shell. values.eye, values.verbal, values.motor are strings.",
    },
    CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget: {
      __state:
        "Optional. values.sex, bun, hemoglobin, sbp, pulse, melena, syncope, hepatic_disease, cardiac_failure. Blank bun, hemoglobin, sbp, or pulse stays incomplete.",
    },
  },
  approximate: [...PASSTHROUGH].filter((type) => type !== "text" && type !== "row"),
};

function canonicalType(block) {
  if (block.type === "clinical") {
    return block.model === "gbs"
      ? CANONICAL.CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget
      : CANONICAL.CalculatorGlasgowComaScaleGcsWidget;
  }
  return ALIAS[block.type] ?? block.type;
}

function payloadOf(block) {
  if (block.__state && typeof block.__state === "object") return block.__state;
  if (block.state && typeof block.state === "object") return block.state;
  return block;
}

function httpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "data:";
  } catch {
    return false;
  }
}

function jobState(block) {
  const source = payloadOf(block);
  return {
    company: source.company ?? null,
    company_logo_url: source.company_logo_url ?? null,
    title: source.title ?? "",
    location: source.location ?? null,
    salary: source.salary ?? null,
    employment_type: source.employment_type ?? source.term ?? null,
    role_summary: source.role_summary ?? source.summary ?? null,
    source: source.source ?? null,
    apply_url_with_tracking: source.apply_url_with_tracking ?? source.url ?? "",
  };
}

function newsItem(item) {
  const domain = item.domain ?? "";
  const url = item.url ?? (domain ? `https://${domain}/` : "");
  return {
    ref: item.ref ?? item.title ?? url,
    url,
    domain,
    source_label: item.source_label ?? item.source ?? "",
    title: item.title ?? "",
    thumbnail_url: item.thumbnail_url ?? null,
    date_label: item.date_label ?? item.date ?? null,
    snippet: item.snippet ?? null,
  };
}

function clinicalState(type, incoming) {
  const base = structuredClone(CLINICAL[type].state);
  if (!incoming) return base;
  for (const key of [
    "title",
    "subtitle",
    "score_label",
    "score_range_label",
    "result_title",
    "summary_prefix",
    "active_info_section",
    "info_sections",
    "inputs",
    "notes",
  ]) {
    if (incoming[key] !== undefined) base[key] = incoming[key];
  }
  if (incoming.values && typeof incoming.values === "object") base.values = { ...base.values, ...incoming.values };
  if (incoming.defaults && typeof incoming.defaults === "object") {
    base.defaults = { ...base.defaults, ...incoming.defaults };
  }
  return base;
}

export function normalizeBlock(block) {
  if (!block || typeof block !== "object") return { type: "text", stream: "word", text: "" };
  if (block.type === "text" || block.type === "row") {
    if (block.type === "row") {
      return { ...block, children: (block.children ?? []).map(normalizeBlock) };
    }
    return block;
  }
  const type = canonicalType(block);
  if (type === CANONICAL.JobsWidget) return { type, state: jobState(block) };
  if (type === CANONICAL.NewsArticleWidget) return { type, state: newsItem(payloadOf(block)) };
  if (type === CANONICAL.NewsArticleWidgetCarousel) {
    const items = payloadOf(block).items ?? [];
    return { type, state: { items: items.map(newsItem) } };
  }
  if (CLINICAL[type]) {
    const incoming = block.__state ?? block.state ?? null;
    return { type, scorer: CLINICAL[type].scorer, state: clinicalState(type, incoming) };
  }
  return block;
}

export function normalizeDocument(input) {
  const doc = input?.document ?? input ?? {};
  return {
    metadata: { model_dil_v2: true, ...(doc.metadata ?? {}) },
    blocks: Array.isArray(doc.blocks) ? doc.blocks.map(normalizeBlock) : [],
  };
}

function checkBlock(block, path, errors) {
  if (!block || typeof block !== "object") {
    errors.push(`${path} is not an object.`);
    return;
  }
  if (block.type === "text") {
    if (typeof block.text !== "string") errors.push(`${path}.text must be a string.`);
    return;
  }
  if (block.type === "row") {
    if (!Array.isArray(block.children)) errors.push(`${path}.children must be an array.`);
    else block.children.forEach((child, index) => checkBlock(child, `${path}.children[${index}]`, errors));
    return;
  }
  const type = canonicalType(block);
  if (PASSTHROUGH.has(type)) return;
  if (type === CANONICAL.JobsWidget) {
    const state = jobState(block);
    if (!state.title.trim()) errors.push(`${path} JobsWidget.title is required.`);
    if (state.apply_url_with_tracking && !httpUrl(state.apply_url_with_tracking)) {
      errors.push(`${path} JobsWidget.apply_url_with_tracking must be an http(s) URL.`);
    }
    return;
  }
  if (type === CANONICAL.NewsArticleWidget) {
    checkNews(newsItem(payloadOf(block)), path, errors);
    return;
  }
  if (type === CANONICAL.NewsArticleWidgetCarousel) {
    const items = payloadOf(block).items;
    if (!Array.isArray(items) || items.length === 0) {
      errors.push(`${path} NewsArticleWidgetCarousel.items must be a non-empty array.`);
      return;
    }
    items.forEach((item, index) => checkNews(newsItem(item), `${path}.items[${index}]`, errors));
    return;
  }
  if (CLINICAL[type]) return;
  errors.push(`${path} has unknown type "${block.type}".`);
}

function checkNews(item, path, errors) {
  if (!item.title.trim()) errors.push(`${path}.title is required.`);
  if (!httpUrl(item.url)) errors.push(`${path}.url must be an http(s) URL.`);
}

export function validateDocument(input) {
  const doc = input?.document ?? input;
  const errors = [];
  if (!doc || typeof doc !== "object" || !Array.isArray(doc.blocks)) {
    return ["document.blocks must be an array."];
  }
  doc.blocks.forEach((block, index) => checkBlock(block, `blocks[${index}]`, errors));
  return errors;
}

export function parseEmbeddedDocument(prompt) {
  const trimmed = prompt.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    const value = JSON.parse(trimmed);
    if (Array.isArray(value)) return { blocks: value };
    if (value && typeof value === "object" && (Array.isArray(value.blocks) || value.document)) {
      return value.document ?? value;
    }
  } catch {
    return null;
  }
  return null;
}
