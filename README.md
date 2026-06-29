# Voice AI Primer

## Local Development

```bash
npm install
npm run build
npm run serve
```

## Community Comments

This fork keeps the original CC0 primer intact and adds a right-side community
comment rail.

- Seed comments live in [`data/community-comments.json`](data/community-comments.json).
- The sidebar and section markers are rendered by
  [`script/community-comments.js`](script/community-comments.js).
- New public comments can be submitted with the
  [community comment issue form](.github/ISSUE_TEMPLATE/comment.yml). Open issues
  labeled `community-comment` are merged into the sidebar at runtime when the
  GitHub API is reachable.
- Keep comments tied to the original section anchors, such as `latency` or
  `telephony`, so GitHub comments can be exported into the same format later.
- `npm run build` validates the static HTML, assets, and comment anchors.

## Deployment

The site is static and can be deployed to Vercel from the repository root. There
is no generated output directory; the build command is a validation step.

## Translation

- Read the [translation.md](translation.md) file for more information.

## File Structure

```
voice-ai-primer-web/
├── index.html              # English (default) - https://voiceaiandvoiceagents.com/
├── ja/
│   └── index.html         # Japanese - https://voiceaiandvoiceagents.com/ja/
... other languages...
├── images/                # Shared assets
├── script/                # Shared JavaScript
├── styles.css             # Shared CSS
└── translations/          # Translation data
```
