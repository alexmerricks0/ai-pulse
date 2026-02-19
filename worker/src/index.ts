/**
 * AI Pulse Worker
 * Cron-triggered AI industry daily briefing
 * Serves API for the public dashboard
 */

import { fetchHNStories } from './hackernews';
import { fetchArxivPapers } from './arxiv';
import { fetchGitHubReleases } from './github';
import { synthesizeBriefing, type BriefingResult } from './claude';

export interface Env {
  DB: D1Database;
  OPENROUTER_API_KEY: string;
  GITHUB_TOKEN: string;
  TRIGGER_SECRET: string;
  ALLOWED_ORIGINS: string;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (allowedOrigins.includes(origin) || env.ENVIRONMENT === 'development') {
      corsHeaders['Access-Control-Allow-Origin'] = origin || '*';
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    let response: Response;

    try {
      switch (true) {
        case url.pathname === '/api/health':
          response = jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
          break;

        case url.pathname === '/api/today':
          response = await getToday(env);
          break;

        case url.pathname.startsWith('/api/date/'):
          response = await getByDate(url, env);
          break;

        case url.pathname === '/api/history':
          response = await getHistory(url, env);
          break;

        case url.pathname === '/api/trigger' && request.method === 'POST': {
          const authHeader = request.headers.get('Authorization');
          if (!env.TRIGGER_SECRET || authHeader !== `Bearer ${env.TRIGGER_SECRET}`) {
            response = jsonResponse({ error: 'Unauthorized' }, 401);
            break;
          }
          await runBriefing(env);
          response = jsonResponse({ status: 'triggered' });
          break;
        }

        default:
          response = jsonResponse({ error: 'Not Found' }, 404);
      }
    } catch (error) {
      console.error('API Error:', error);
      response = jsonResponse({ error: 'Internal Server Error' }, 500);
    }

    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  },

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    console.log('Cron triggered at', controller.scheduledTime);
    ctx.waitUntil(
      withRetry(() => runBriefing(env), 3, 5000)
        .catch((error) => console.error('All retry attempts failed for briefing:', error)),
    );
  },
};

// ============================================================================
// Core Briefing Pipeline
// ============================================================================

async function runBriefing(env: Env): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  // Idempotency check
  const existing = await env.DB.prepare(
    'SELECT id FROM daily_briefings WHERE date = ?',
  ).bind(today).first();

  if (existing) {
    console.log(`Briefing for ${today} already exists, skipping`);
    return;
  }

  // Step 1: Fetch from all sources in parallel
  console.log('Fetching sources...');
  const [hnStories, papers, releases] = await Promise.all([
    fetchHNStories(),
    fetchArxivPapers(),
    fetchGitHubReleases(env.GITHUB_TOKEN),
  ]);
  console.log(`Fetched ${hnStories.length} HN stories, ${papers.length} papers, ${releases.length} releases`);

  // Step 2: Synthesize with Claude
  console.log('Synthesizing briefing...');
  const { briefing, tokensUsed } = await synthesizeBriefing(
    hnStories, papers, releases, env.OPENROUTER_API_KEY,
  );
  console.log(`Briefing complete, ${tokensUsed} tokens used`);

  // Step 3: Store briefing
  const sourcesData = JSON.stringify({ hn: hnStories, arxiv: papers, github: releases });

  await env.DB.prepare(
    `INSERT INTO daily_briefings (date, sources_data, briefing, model, tokens_used)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(today, sourcesData, JSON.stringify(briefing), 'haiku', tokensUsed)
    .run();

  console.log(`Briefing for ${today} stored successfully`);
}

// ============================================================================
// API Route Handlers
// ============================================================================

async function getToday(env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    `SELECT date, briefing, tokens_used, created_at
     FROM daily_briefings ORDER BY date DESC LIMIT 1`,
  ).first<{ date: string; briefing: string; tokens_used: number; created_at: string }>();

  if (!result) {
    return jsonResponse({ error: 'No briefing available yet' }, 404);
  }

  return jsonResponse({
    date: result.date,
    briefing: JSON.parse(result.briefing),
    tokensUsed: result.tokens_used,
    createdAt: result.created_at,
  });
}

async function getByDate(url: URL, env: Env): Promise<Response> {
  const dateStr = url.pathname.replace('/api/date/', '');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return jsonResponse({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
  }

  const result = await env.DB.prepare(
    `SELECT date, briefing, tokens_used, created_at
     FROM daily_briefings WHERE date = ?`,
  ).bind(dateStr).first<{ date: string; briefing: string; tokens_used: number; created_at: string }>();

  if (!result) {
    return jsonResponse({ error: `No briefing for ${dateStr}` }, 404);
  }

  return jsonResponse({
    date: result.date,
    briefing: JSON.parse(result.briefing),
    tokensUsed: result.tokens_used,
    createdAt: result.created_at,
  });
}

async function getHistory(url: URL, env: Env): Promise<Response> {
  const daysParam = url.searchParams.get('days');
  const days = parseIntParam(daysParam, 30, 1, 365);
  const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

  const results = await env.DB.prepare(
    `SELECT date, briefing, created_at
     FROM daily_briefings WHERE date >= ? ORDER BY date DESC`,
  ).bind(startDate).all<{ date: string; briefing: string; created_at: string }>();

  const data = (results.results || []).map((row) => {
    const briefing = JSON.parse(row.briefing) as BriefingResult;
    return {
      date: row.date,
      headline: briefing.headline,
      trend: briefing.trend,
      storyCount: briefing.stories.length,
      paperCount: briefing.papers.length,
    };
  });

  return jsonResponse({ data });
}

// ============================================================================
// Utilities
// ============================================================================

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseIntParam(value: string | null, defaultValue: number, min: number, max: number): number {
  if (value === null) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  return Math.max(min, Math.min(max, parsed));
}

async function withRetry<T>(fn: () => Promise<T>, attempts: number, delayMs: number): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${i + 1}/${attempts} failed:`, error);
      if (i === attempts - 1) throw error;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
  throw new Error('unreachable');
}
