# ChatGPT Intelligent UI

Clean-room replica of the widget UI on logged-out [chatgpt.com](https://chatgpt.com/), recovered with [REA](https://github.com/morluto/REA).

The page never calls this “Intelligent UI”. In the client it is **canonical DIL**, marked `model_dil_v2` / `modelDilV2`, rendered inside the Octane shell (`unauth-mweb`). This repo keeps the REA evidence and a small React app that speaks the same widget contract.

No account, cookies, or signed-in session were used. The replica is original UI code. It is not a dump of ChatGPT source, and it is not affiliated with OpenAI.

This repo is two parts: a React component library, and an agent skill that calls it.

## Component library

`replica/` is the widget library. The demo app and `POST /api/complete` are thin callers. The public entry is `replica/src/index.js`.

```jsx
import { DilRoot } from "./replica/src/index.js";
import "./replica/src/styles.css";

<DilRoot doc={document} />
```

`document` is `{ metadata: { model_dil_v2: true }, blocks: [...] }`. The same entry exports `normalizeDocument`, `validateDocument`, and the individual cards (`JobsCard`, `NewsCarousel`, `ClinicalCard`, and the layout cards). A project that depends on the `replica` package can import `intelligent-ui-replica` and `intelligent-ui-replica/styles.css`.

## Agent skill

`.agents/skills/canonical-dil-response/` is the skill other agents load. Cursor, Codex, and Copilot read `.agents/skills/`. The same files are copied to `.claude/skills/`, `.codex/skills/`, and `.github/skills/` so Claude Code, Codex, and Copilot find them in a fresh clone.

To use it in every project on your machine, copy that folder to `~/.agents/skills/canonical-dil-response/`. Claude Code also needs a copy at `~/.claude/skills/canonical-dil-response/`.

The skill tells the agent to render a page with `<DilRoot>`, and to answer in chat by running `scripts/render.mjs`. It does not post the document to the local page.

## Quick start

```bash
cd replica
npm install
npm run dev
```

Open http://localhost:5173/. The empty state has Seattle, markets, jobs and headlines, clinical scores, and a short quiz. Streaming is scripted. Nothing here calls the ChatGPT API.

## Recovered with REA

[REA](https://github.com/morluto/REA) (`rea-agents`) was pointed at the public logged-out homepage:

1. A headed Chrome capture got past the logged-out shell. Headless only stopped on the Cloudflare interstitial.
2. `export-web-scripts` unpacked the page scripts into `unpacked/`.
3. Public DIL chunks that the homepage references, including `assistant-canonical-dil-v2`, were saved into `ui-modules/`.
4. `analyze-javascript-application` built two static graphs: the Octane shell and the DIL modules. Those graphs are in `analysis/`.

Widget names, field names, and the tool-result join come from that static read. The scripts were not executed, and a live model reply was never observed. The longer evidence note is [FINDINGS.md](FINDINGS.md).

## What the original client does

The model does not call React components. It writes a DIL document. The client mounts a component by name and fills it from a tool result.

A message is treated as canonical DIL when it carries `model_dil_v2`, or a `contentReferences` entry of type `client_defined_widget`. Product widgets such as `JobsWidget` then resolve `state` from `opGenui.componentResults`, keyed by invocation id. A missing or bad tool comes back as `tool_failed`, `invalid_tool_result`, or `component_unavailable`. Older cards (weather, currency, stock) are selected by `data-dil-widget-name` and loaded from `assistant-dil`.

## Replica widgets

| Widget | Match |
| --- | --- |
| `JobsWidget` | Same `__state` fields as the client: company, logo, title, location, salary, `employment_type`, `role_summary`, source, `apply_url_with_tracking` |
| `NewsArticleWidget`, `NewsArticleWidgetCarousel` | Source, title, 100px thumbnail, date, snippet, url |
| `CalculatorGlasgowComaScaleGcsWidget` | Eye, verbal, and motor. Same band cutoffs |
| `CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget` | Same point rules. Blank required fields stay incomplete |
| Weather, clock, schedule, location, stock, currency, pie, quiz, flashcard, calculator | Layout only. Field names are not the client’s |

Clinical cards are an educational copy of the scoring rules found in the client. They are not a medical device.

## Use it from an LLM or a local API

`GET /api/schema` lists the contract. `POST /api/complete` accepts either a chat prompt or a document. The same JSON can be pasted into the composer.

```bash
curl -s http://localhost:5173/api/schema

curl -s http://localhost:5173/api/complete \
  -H "content-type: application/json" \
  -d "{\"document\":{\"metadata\":{\"model_dil_v2\":true},\"blocks\":[{\"type\":\"JobsWidget\",\"__state\":{\"company\":\"Figma\",\"title\":\"Product designer\",\"location\":\"Seattle, WA\",\"salary\":\"$160k-$210k\",\"employment_type\":\"Full-time\",\"role_summary\":\"Own the canvas.\",\"source\":\"linkedin\",\"apply_url_with_tracking\":\"https://www.linkedin.com/jobs/\"}}]}}"
```

A clinical widget can send only `values`. The client shell fills in the rest.

## Layout

```
chatgpt-intelligent-ui/
├── replica/                         component library and the demo app
│   └── src/index.js                 DilRoot and the widget cards
├── .agents/skills/canonical-dil-response/   agent skill (source copy)
├── ui-modules/                      public DIL chunks REA downloaded
├── unpacked/                        scripts exported from the logged-out homepage
├── capture/                         scenarios and string extracts
├── analysis/                        REA application graphs
└── FINDINGS.md                      evidence notes
```

## Limits

- Logged-out homepage only. No observed live model stream.
- Several hundred locale chunks were left queued.
- REA marked the graphs as incomplete where relationship expansion exceeded its budget.
