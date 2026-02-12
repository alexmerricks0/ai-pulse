# CLAUDE.md — AI Pulse

## Project Overview

AI-powered daily intelligence on the AI/ML industry. A Cloudflare Worker runs daily via Cron Trigger, aggregates AI news from multiple sources (HN, arxiv, major announcements), sends to Claude for synthesis, stores in D1, and serves a public dashboard via Cloudflare Pages.

**Live at:** `ai.lfxai.dev`

## Architecture

```
Cron Trigger (daily) → Worker → HN API / arXiv RSS / Sources → Claude API → D1 → Dashboard (Pages)
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Worker | `worker/` | Cron-triggered agent: fetches AI news sources, calls Claude for synthesis, stores in D1, serves API |
| Dashboard | `dashboard/` | React frontend displaying daily AI industry briefings |
| Schema | `schema.sql` | D1 database schema |

## Tech Stack

- **Cloudflare Workers** — Cron Trigger + API
- **Cloudflare D1** — SQLite storage for daily briefings
- **Cloudflare Pages** — Dashboard hosting
- **Claude API** — AI synthesis (Haiku for cost efficiency)
- **React + Vite + TypeScript** — Frontend
- **Tailwind CSS** — Styling

## Key Facts

- **Repo:** `~/Business/ai-pulse/`
- **GitHub:** `alexmerricks0/ai-pulse` (public)
- **Hosting:** Cloudflare Pages + Workers
- **Domain:** `ai.lfxai.dev`
- **Cron Schedule:** Daily at 07:00 UTC
- **License:** MIT

## Design System

Matches lfxai.dev:
- Background: `#0a0a0a`
- Accent: `#c9a227`
- Fonts: Bricolage Grotesque / DM Sans / JetBrains Mono

## Important Notes

- Claude API key stored via `wrangler secret put ANTHROPIC_API_KEY`
- Use Haiku model to minimize API costs
- All data is public — no auth required on dashboard
- News sources: HN API (free), arXiv RSS (free), GitHub releases (free)
- CORS should allow the Pages domain
