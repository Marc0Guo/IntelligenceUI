# Draw by hand

Use this only when `scripts/render.mjs` cannot run. The renderer is the normal path, and it already draws every block below.

One fragment. Root id is unique. Scope every selector under that id. Support both themes with `light-dark()`. Put the script after the markup. Update text and `aria-pressed` on existing nodes. Do not assign `innerHTML` after listeners are attached. No doctype, `html`, `head`, or `body` in the fragment. No network. No links in a fragment; a full page may use `http` or `https` links.

Card surface: background `light-dark(#fff, #212121)`, text `light-dark(#0d0d0d, #ececec)`, muted `light-dark(#5d5d5d, #a0a0ab)`, 1px border, radius 20px, padding 16px. Title 18px.

`weather`: city, condition, temperature, `°F` / `°C` toggle, summary, hour bars. `JobsWidget`: company, title, apply button, location, salary, employment type, summary. `NewsArticleWidget`: source, title, date, snippet. Clinical: kicker "Clinical risk calculator", score, band, and the inputs. GCS is eye + verbal + motor: 13–15 mild, 9–12 moderate, otherwise severe. Glasgow-Blatchford stays incomplete until sex, BUN, hemoglobin, systolic pressure, and pulse are filled.

`clock` shows the place time. `schedule` lists time and title. `location` is name, area, and note. `stock` is symbol, price, and change. `currency` is the converted amount. `pie` is labeled slices. `quiz` reveals whether the tapped choice is correct. `flashcard` flips. `calculator` updates a readout from its keys. `followups` are buttons and do not send a new chat message.
