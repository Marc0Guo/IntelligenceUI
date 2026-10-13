---
name: canonical-dil-response
description: >-
  Draw canonical DIL widgets (jobs, news, weather, markets, quiz, Glasgow and
  Glasgow-Blatchford scores) in the chat for any coding agent. Use when the
  user wants a rendered widget reply, Intelligent UI, DIL, jobs, headlines, a
  clinical score, or an agent answer shown as those widgets. Do not post the
  reply to a local server.
compatibility: Requires Node.js to run scripts/render.mjs. No network and no local server.
---

# Canonical DIL responses

Draw the widgets in the chat. Do not `POST` to `localhost`, `/api/inbox`, or `/api/complete`.

This repo has two parts. The React component library is `replica/` (`replica/src/index.js`). This skill is how an agent calls it. Cursor, Codex, and Copilot load `.agents/skills/canonical-dil-response/`. Claude Code loads `.claude/skills/canonical-dil-response/`. The `.codex/skills/` and `.github/skills/` copies are the same package.

## Call the component library

When the user is building a page, render the document with the library. Do not redraw the cards.

```jsx
import { DilRoot } from "./replica/src/index.js";
import "./replica/src/styles.css";

<DilRoot doc={document} />
```

`document` uses the shapes in [widgets.md](widgets.md). `normalizeDocument` and `validateDocument` come from the same entry. A package that depends on `replica/` can import `intelligent-ui-replica` and `intelligent-ui-replica/styles.css`.

## Reply

1. Choose the smallest set of blocks that answers the question. Shapes are in [widgets.md](widgets.md). Worked replies are in [examples.md](examples.md).
2. Write that document to a JSON file. Run the renderer that ships beside this file:

```
node scripts/render.mjs reply.json
```

Stdout is one HTML fragment. `node scripts/render.mjs --document reply.json` prints a complete page, with real `http` links, for a host that opens a file.

3. Show that HTML in the conversation. Keep the prose to one or two sentences. Do not paste the JSON. Delete the temporary JSON file when you are done.
4. If Node cannot run, draw the fragment by hand using [chat.md](chat.md).

Clinical widgets are educational copies of the client scorers. Say they are not for clinical use. Do not add a diagnosis beyond the widget's own band text.

## Where the HTML goes

Use the host's inline HTML preview when it has one.

- Cursor: write the fragment (not the `--document` page) to the agent store at `visualizations/<slug>.html`. Never overwrite an existing visualization file. After the write, put this tag on its own line:

```html
<cursor-content kind="visualization" src="visualizations/<slug>.html"></cursor-content>
```

- Claude, Codex, Copilot, and any other agent: preview the fragment in the chat when that host renders HTML. If the host would only show the source, write the `--document` page to `canonical-dil-reply.html` in the working directory and give the user that path.

Inline previews cannot open apply links, article URLs, or remote images. The `--document` page can.

## Which widget

| User is asking for | Block |
| --- | --- |
| Open roles | `JobsWidget` |
| Headlines | `NewsArticleWidget`, or `NewsArticleWidgetCarousel` when there are two or more |
| Coma scale | `CalculatorGlasgowComaScaleGcsWidget` |
| Upper GI bleed score | `CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget` |
| Weather, time, a plan, a place | `weather`, `clock`, `schedule`, `location` |
| A quote, a conversion, a split | `stock`, `currency`, `pie` |
| A short test | `quiz`, `flashcard` |
| Arithmetic the user can tap | `calculator` |
| A next question | `followups` |

Put two related cards in a `row`. A clinical widget may send only `values`. The renderer fills the shell and computes the score. Leave `bun`, `hemoglobin`, `sbp`, or `pulse` as `""` when the user has not given that number.
