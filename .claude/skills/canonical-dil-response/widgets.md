# Widget blocks

Every document is `{ "metadata": { "model_dil_v2": true }, "blocks": [ ... ] }`.

## Text and row

```json
{ "type": "text", "stream": "word", "text": "One short answer." }
```

```json
{ "type": "row", "children": [ { "type": "weather" }, { "type": "clock" } ] }
```

## JobsWidget

```json
{
  "type": "JobsWidget",
  "__state": {
    "company": "Figma",
    "company_logo_url": null,
    "title": "Product designer",
    "location": "Seattle, WA",
    "salary": "$160k-$210k",
    "employment_type": "Full-time",
    "role_summary": "Own the canvas.",
    "source": "linkedin",
    "apply_url_with_tracking": "https://www.linkedin.com/jobs/"
  }
}
```

`source` is `linkedin`, `indeed`, `upwork`, `ziprecruiter`, or anything else (the button then says Apply). `title` is required.

## News

One card uses `NewsArticleWidget`. Several use `NewsArticleWidgetCarousel` with `__state.items`.

```json
{
  "type": "NewsArticleWidget",
  "__state": {
    "ref": "pier",
    "url": "https://www.seattletimes.com/",
    "domain": "seattletimes.com",
    "source_label": "The Seattle Times",
    "title": "Waterfront park opens the last pier walkway",
    "thumbnail_url": null,
    "date_label": "Oct 11, 2026",
    "snippet": "The Pine Street connection opened overnight."
  }
}
```

`title` and `url` are required.

## Clinical

```json
{
  "type": "CalculatorGlasgowComaScaleGcsWidget",
  "__state": { "values": { "eye": "3", "verbal": "4", "motor": "5" } }
}
```

Eye is 1-4, verbal is 1-5, motor is 1-6, all strings.

```json
{
  "type": "CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget",
  "__state": {
    "values": {
      "sex": "male",
      "bun": "22",
      "hemoglobin": "12.5",
      "sbp": "118",
      "pulse": "88",
      "melena": "0",
      "syncope": "0",
      "hepatic_disease": "0",
      "cardiac_failure": "0"
    }
  }
}
```

`sex` is `male` or `female`. Yes/no fields are `"1"` or `"0"`.

## Layout widgets

```json
{ "type": "weather", "city": "Seattle", "condition": "Light rain late", "tempC": 14, "tempF": 57, "summary": "Showers after 2pm", "hours": [{ "label": "9a", "c": 12, "f": 54 }] }
{ "type": "clock", "place": "Seattle", "offsetHours": -7 }
{ "type": "schedule", "title": "Saturday", "items": [{ "time": "9:30", "title": "Pike Place", "detail": "Go early." }] }
{ "type": "location", "name": "Pike Place Market", "area": "Downtown Seattle", "note": "Enter from Pine Street." }
{ "type": "stock", "symbol": "SPX", "name": "S&P 500", "price": "5842", "change": "+0.84%", "ranges": { "1D": [40, 42, 55, 58] } }
{ "type": "currency", "amount": 250, "from": "USD", "to": "EUR", "rate": 0.92 }
{ "type": "pie", "title": "Day's move", "slices": [{ "label": "Tech", "value": 46, "color": "#2451da" }] }
{ "type": "quiz", "questions": [{ "prompt": "Question?", "choices": ["A", "B"], "answer": 1 }] }
{ "type": "flashcard", "front": "Prompt", "back": "Answer" }
{ "type": "calculator", "title": "Tip", "start": "64" }
{ "type": "followups", "items": ["What should I pack?"] }
```
