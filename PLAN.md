# AI Pulse — Implementation Plan

## Overview

Daily AI-powered intelligence on the AI/ML industry. A Cloudflare Worker runs on a cron schedule, aggregates AI news from Hacker News, arXiv, and GitHub releases, sends to Claude for synthesis, stores in D1, and serves a public dashboard.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  Cloudflare Worker (ai-pulse-worker)                  │
│                                                       │
│  Cron Trigger (07:00 UTC daily)                       │
│    ├── 1. Fetch HN top stories (filter AI/ML)         │
│    ├── 2. Fetch arXiv CS.AI + CS.LG new papers        │
│    ├── 3. Fetch major AI repo releases (GitHub API)    │
│    ├── 4. Send to Claude Haiku for synthesis           │
│    ├── 5. Store structured briefing in D1              │
│    └── 6. Done                                        │
│                                                       │
│  API Routes                                           │
│    ├── GET /api/today        → today's briefing       │
│    ├── GET /api/history      → past 30 days           │
│    ├── GET /api/weekly       → weekly summary          │
│    └── GET /api/health       → health check           │
└──────────────────────────────────────────────────────┘
```

## Data Sources

| Source | API | What We Get |
|--------|-----|-------------|
| Hacker News | `https://hacker-news.firebaseio.com/v0/` | Top stories, filter for AI/ML keywords |
| arXiv | `http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate` | New AI/ML papers |
| GitHub | Search API for releases in major AI repos | Model releases, framework updates |

## Claude Prompt

```
You are an AI industry analyst. Given today's aggregated news from HN, arXiv,
and GitHub, produce a daily briefing.

Output JSON:
- headline: one-sentence summary of the day in AI
- stories: top 5-8 stories ranked by significance, each with title, source, url, one-line summary, significance (1-5)
- papers: top 3 noteworthy papers with plain-english summaries
- releases: any major model/framework releases
- trend: what theme or direction is emerging this week
```

## D1 Schema

```sql
CREATE TABLE IF NOT EXISTS daily_briefings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  sources_data TEXT NOT NULL,       -- raw aggregated input (JSON)
  briefing TEXT NOT NULL,           -- Claude's structured output (JSON)
  model TEXT NOT NULL DEFAULT 'haiku',
  tokens_used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS weekly_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## Dashboard Sections

1. **Header** — "AI Pulse" + date
2. **Today's Headline** — AI-generated one-liner
3. **Top Stories** — Ranked cards with source, summary, significance indicator
4. **Papers** — Notable papers with plain-english summaries
5. **Releases** — Model/framework release timeline
6. **Weekly Trend** — What direction AI is heading
7. **Archive** — Browse past days

## Cost: ~$0.15/month (same pattern as trending-intel)

## Build After: trending-intel (clone the architecture)
