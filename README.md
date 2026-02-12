# AI Pulse

AI-powered daily intelligence on the AI/ML industry. A Cloudflare Worker aggregates news from Hacker News, arXiv, and GitHub releases each morning, sends them to Claude for synthesis, stores the structured briefing in D1, and serves it through a public dashboard.

**Live at [ai.lfxai.dev](https://ai.lfxai.dev)**

## How It Works

```
Cron (07:00 UTC) → HN + arXiv + GitHub Releases → Claude Haiku → D1 → Dashboard
```

1. **Aggregate** — Fetch AI-filtered HN stories, latest cs.AI/cs.LG papers, and releases from major AI repos
2. **Synthesize** — Claude Haiku ranks stories by significance and produces a daily briefing
3. **Store** — Structured briefing persisted in Cloudflare D1
4. **Serve** — React dashboard displays stories, papers, and releases with archive browsing

## Data Sources

| Source | What It Provides |
|--------|-----------------|
| Hacker News | AI-filtered top stories from the developer community |
| arXiv | Latest CS.AI and CS.LG papers with plain-English summaries |
| GitHub Releases | New versions from major AI frameworks (transformers, ollama, langchain, etc.) |

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite at edge) |
| AI | Claude Haiku via OpenRouter |
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Hosting | Cloudflare Pages |
| Data | SWR with 5-minute refresh |

## Project Structure

```
├── worker/
│   ├── src/
│   │   ├── index.ts        # Worker entry, API routes, cron handler
│   │   ├── hackernews.ts   # HN API client with AI keyword filtering
│   │   ├── arxiv.ts        # arXiv Atom feed parser
│   │   ├── github.ts       # GitHub Releases tracker
│   │   └── claude.ts       # AI synthesis via OpenRouter
│   └── wrangler.toml       # Worker + D1 + cron config
├── dashboard/
│   ├── src/
│   │   ├── App.tsx          # Main app with view routing
│   │   ├── api.ts           # Typed API client
│   │   └── components/      # Header, StoryCard, PapersSection, etc.
│   └── tailwind.config.js   # lfxai.dev design system
└── schema.sql               # D1 database schema
```

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/today` | Latest briefing |
| `GET /api/date/:date` | Briefing for a specific date (YYYY-MM-DD) |
| `GET /api/history?days=30` | Past briefings with headlines |
| `GET /api/health` | Health check |

## Local Development

```bash
# Worker
cd worker
cp .dev.vars.example .dev.vars  # Add your API keys
npm install
npx wrangler dev --test-scheduled

# Dashboard
cd dashboard
npm install
npm run dev
```

## Cost

Runs entirely on Cloudflare's free tier plus ~$0.15/month for Claude Haiku API calls.

## License

MIT
