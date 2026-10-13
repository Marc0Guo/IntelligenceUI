# Examples

## Jobs

User: Show two design roles in Seattle.

Save this document as `reply.json` and run `node scripts/render.mjs reply.json`. Show the HTML in the chat. Do not post it to localhost.

```json
{
  "metadata": { "model_dil_v2": true },
  "blocks": [
    {
      "type": "text",
      "stream": "word",
      "text": "Two Seattle design roles are open this week."
    },
    {
      "type": "JobsWidget",
      "__state": {
        "company": "Figma",
        "title": "Product designer, collaboration",
        "location": "Seattle, WA",
        "salary": "$160k-$210k",
        "employment_type": "Full-time",
        "role_summary": "Own comments and presence on the canvas.",
        "source": "linkedin",
        "apply_url_with_tracking": "https://www.linkedin.com/jobs/"
      }
    }
  ]
}
```

## Glasgow score

User: Eye opening to sound, confused speech, localizes pain.

`values` are `eye` `"3"`, `verbal` `"4"`, `motor` `"5"`. The text block says this is not for clinical use. Do not restate a diagnosis. The renderer computes the band.
