export const suggestions = [
  { label: "Seattle this weekend", prompt: "What's Seattle like this weekend?" },
  { label: "Markets and currency", prompt: "How are markets doing, and what is 250 dollars in euros?" },
  { label: "Jobs and headlines", prompt: "Show me design jobs and today's headlines." },
  { label: "Clinical scores", prompt: "Walk me through a Glasgow score." },
  { label: "Quiz me", prompt: "Quiz me on something short." },
];

const seattle = {
  metadata: { model_dil_v2: true },
  blocks: [
    {
      type: "text",
      stream: "word",
      text: "Saturday looks like the better day to be outside. Sunday turns wet after lunch, so keep the morning for the market and the waterfront.",
    },
    {
      type: "row",
      children: [
        {
          type: "weather",
          city: "Seattle",
          condition: "Light rain late",
          tempC: 14,
          tempF: 57,
          summary: "Clouds early, showers after 2pm",
          hours: [
            { label: "9a", c: 12, f: 54 },
            { label: "11a", c: 14, f: 57 },
            { label: "1p", c: 15, f: 59 },
            { label: "3p", c: 14, f: 57 },
            { label: "5p", c: 13, f: 55 },
            { label: "7p", c: 12, f: 54 },
          ],
        },
        {
          type: "clock",
          place: "Seattle",
          offsetHours: -7,
        },
      ],
    },
    {
      type: "schedule",
      title: "Saturday",
      items: [
        { time: "9:30", title: "Pike Place", detail: "Go early. The stalls are quieter before 11." },
        { time: "13:00", title: "Ferry to Bainbridge", detail: "About 35 minutes. Sit on the west side for the skyline." },
        { time: "16:30", title: "Capitol Hill walk", detail: "If the rain holds off, end at Cal Anderson." },
      ],
    },
    {
      type: "location",
      name: "Pike Place Market",
      area: "Downtown Seattle",
      note: "Enter from Pine Street. The main arcade is one level down.",
    },
    {
      type: "followups",
      items: ["What should I pack?", "A Sunday backup plan"],
    },
  ],
};

const markets = {
  metadata: { model_dil_v2: true },
  blocks: [
    {
      type: "text",
      stream: "word",
      text: "The index is up on the day, led by the larger names. The dollar is a little softer against the euro than it was at the open.",
    },
    {
      type: "stock",
      symbol: "SPX",
      name: "S&P 500",
      price: "5,842.16",
      change: "+0.84%",
      ranges: {
        "1D": [40, 42, 39, 44, 46, 45, 48, 52, 50, 55, 53, 58],
        "1W": [30, 36, 34, 41, 39, 48, 52, 49, 58],
        "1M": [22, 28, 26, 33, 40, 38, 46, 44, 51, 58, 55, 62],
      },
    },
    {
      type: "row",
      children: [
        {
          type: "currency",
          amount: 250,
          from: "USD",
          to: "EUR",
          rate: 0.92,
        },
        {
          type: "pie",
          title: "Day's move",
          slices: [
            { label: "Tech", value: 46, color: "#2451da" },
            { label: "Health", value: 22, color: "#04bb9f" },
            { label: "Finance", value: 18, color: "#ff8066" },
            { label: "Other", value: 14, color: "#c4c4c4" },
          ],
        },
      ],
    },
  ],
};

const quiz = {
  metadata: { model_dil_v2: true },
  blocks: [
    {
      type: "text",
      stream: "word",
      text: "Three short checks. Pick an answer, then flip the card if you want the one-line version.",
    },
    {
      type: "quiz",
      questions: [
        {
          prompt: "A partial island updates which part of a reply?",
          choices: ["The whole page", "One marked region", "Only the sidebar"],
          answer: 1,
        },
        {
          prompt: "Which stream fits a sentence?",
          choices: ["Chart reveal", "Word by word", "Media only"],
          answer: 1,
        },
        {
          prompt: "A stock range control is which primitive?",
          choices: ["Segmented control", "Swipe stack", "Date picker"],
          answer: 0,
        },
      ],
    },
    {
      type: "flashcard",
      front: "What does a content reference point at?",
      back: "A widget or passage inside the assistant message, not the whole conversation.",
    },
  ],
};

const pack = {
  metadata: { model_dil_v2: true },
  blocks: [
    {
      type: "text",
      stream: "word",
      text: "Pack a light shell, a compact umbrella, and shoes that can handle wet pavement. Evenings are around 12°C.",
    },
    {
      type: "calculator",
      title: "Tip on a $64 dinner",
      start: "64",
    },
  ],
};

const sunday = {
  metadata: { model_dil_v2: true },
  blocks: [
    {
      type: "text",
      stream: "word",
      text: "If Sunday rains, stay indoors until noon. The museum and a long lunch cover the wet half of the day.",
    },
    {
      type: "schedule",
      title: "Sunday backup",
      items: [
        { time: "11:00", title: "Seattle Art Museum", detail: "The third floor is the quieter loop." },
        { time: "14:00", title: "Lunch in Pioneer Square", detail: "Book a window seat and walk back if it clears." },
      ],
    },
  ],
};

function mark(letter, fill) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${fill}"/><text x="40" y="52" text-anchor="middle" font-size="40" font-family="Segoe UI,sans-serif" fill="white">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const jobsNews = {
  metadata: { model_dil_v2: true },
  blocks: [
    {
      type: "text",
      stream: "word",
      text: "Two open roles match a product-design search in Seattle. The headlines beside them are this morning's design and city coverage.",
    },
    {
      type: "JobsWidget",
      __state: {
        source: "linkedin",
        company: "Figma",
        company_logo_url: mark("F", "#0d0d0d"),
        title: "Product designer, collaboration",
        location: "Seattle, WA",
        salary: "$160k–$210k",
        employment_type: "Full-time",
        role_summary:
          "Own the multiplayer canvas for comments, presence, and follow mode. Hybrid, three days in the South Lake Union studio.",
        apply_url_with_tracking: "https://www.linkedin.com/jobs/",
      },
    },
    {
      type: "JobsWidget",
      __state: {
        source: "indeed",
        company: "Expedia",
        company_logo_url: mark("E", "#1a1a1a"),
        title: "Senior product designer",
        location: "Seattle, WA · Hybrid",
        salary: "$175k–$230k",
        employment_type: "Full-time",
        role_summary: "Design the trip-planning flow from search through checkout, with a weekly prototype review.",
        apply_url_with_tracking: "https://www.indeed.com/",
      },
    },
    {
      type: "NewsArticleWidgetCarousel",
      __state: {
        items: [
          {
            ref: "pier",
            source_label: "The Seattle Times",
            domain: "seattletimes.com",
            url: "https://www.seattletimes.com/",
            title: "Waterfront park opens the last pier walkway before cruise season",
            date_label: "Oct 11, 2026",
            snippet: "The city finished the Pine Street connection overnight. Weekend crowds are expected by the market stairs.",
            thumbnail_url: mark("S", "#2451da"),
          },
          {
            ref: "cursors",
            source_label: "Reuters",
            domain: "reuters.com",
            url: "https://www.reuters.com/",
            title: "Design tools add shared cursors as office days return",
            date_label: "Oct 11, 2026",
            snippet: "Vendors are shipping presence features that keep a remote reviewer on the same frame as the room.",
            thumbnail_url: mark("R", "#3d3d3d"),
          },
          {
            ref: "camera",
            source_label: "The Verge",
            domain: "theverge.com",
            url: "https://www.theverge.com/",
            title: "A quieter phone camera mode aimed at museums and galleries",
            date_label: "Oct 10, 2026",
            snippet: "The shutter stays silent and the preview drops to a dimmer frame so the room stays dark.",
            thumbnail_url: mark("V", "#7a3e66"),
          },
        ],
      },
    },
  ],
};

const clinical = {
  metadata: { model_dil_v2: true },
  blocks: [
    {
      type: "text",
      stream: "word",
      text: "Two clinical scorecards share one shell: a blue header, a live total, and inputs you can reset. The coma scale starts in the moderate band. Clear a required field on the bleed score and it drops to incomplete.",
    },
    { type: "CalculatorGlasgowComaScaleGcsWidget" },
    {
      type: "CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget",
      __state: {
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
      },
    },
  ],
};

export function documentFor(prompt) {
  const text = prompt.toLowerCase();
  if (text.includes("pack")) return pack;
  if (text.includes("sunday") || text.includes("backup")) return sunday;
  if (text.includes("job") || text.includes("headline") || text.includes("news")) return jobsNews;
  if (text.includes("glasgow") || text.includes("clinical") || text.includes("score") || text.includes("coma")) return clinical;
  if (text.includes("market") || text.includes("currency") || text.includes("euro") || text.includes("dollar")) return markets;
  if (text.includes("quiz")) return quiz;
  return seattle;
}
