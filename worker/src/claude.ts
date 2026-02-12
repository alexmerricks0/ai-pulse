/**
 * AI synthesis client
 * Raw fetch to OpenRouter API (OpenAI-compatible format)
 */

import type { HNStory } from './hackernews';
import type { ArxivPaper } from './arxiv';
import type { GitHubRelease } from './github';

export interface StoryItem {
  title: string;
  source: 'hackernews' | 'arxiv' | 'github';
  url: string;
  summary: string;
  significance: number;
}

export interface PaperItem {
  title: string;
  authors: string;
  summary: string;
  url: string;
}

export interface ReleaseItem {
  repo: string;
  version: string;
  summary: string;
  url: string;
}

export interface BriefingResult {
  headline: string;
  stories: StoryItem[];
  papers: PaperItem[];
  releases: ReleaseItem[];
  trend: string;
}

interface OpenRouterResponse {
  choices: Array<{ message: { content: string } }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export async function synthesizeBriefing(
  hnStories: HNStory[],
  papers: ArxivPaper[],
  releases: GitHubRelease[],
  apiKey: string,
): Promise<{ briefing: BriefingResult; tokensUsed: number }> {
  const hnSummary = hnStories
    .map((s) => `- [HN ${s.score}pts] ${s.title} (${s.url})`)
    .join('\n');

  const paperSummary = papers
    .map((p) => `- [arXiv] ${p.title} by ${p.authors.slice(0, 3).join(', ')}${p.authors.length > 3 ? ' et al.' : ''}: ${p.abstract.slice(0, 200)}...`)
    .join('\n');

  const releaseSummary = releases.length > 0
    ? releases.map((r) => `- [Release] ${r.repo} ${r.tag}: ${r.title}`).join('\n')
    : '- No major releases in the past 48 hours';

  const systemPrompt = `You are an expert AI industry analyst. Produce a concise daily briefing synthesizing AI news from Hacker News, arXiv papers, and GitHub releases. Be insightful and opinionated. Focus on what matters to AI practitioners and engineers.`;

  const userPrompt = `Here are today's AI/ML sources:

## Hacker News (AI-filtered)
${hnSummary || '- No AI stories trending today'}

## arXiv Papers (cs.AI + cs.LG)
${paperSummary || '- No new papers'}

## GitHub Releases
${releaseSummary}

Synthesize these into a daily briefing. Output ONLY valid JSON (no markdown, no code fences):

{
  "headline": "One sentence capturing today's biggest AI story or theme",
  "stories": [
    { "title": "Story title", "source": "hackernews|arxiv|github", "url": "url", "summary": "One-line insight", "significance": 1-5 }
  ],
  "papers": [
    { "title": "Paper title", "authors": "First Author et al.", "summary": "Plain-English 2-sentence explanation of what this paper does and why it matters", "url": "arxiv url" }
  ],
  "releases": [
    { "repo": "owner/name", "version": "v1.0.0", "summary": "What changed and why it matters", "url": "url" }
  ],
  "trend": "2-3 sentences on the emerging theme across today's sources"
}

Rules:
- stories: pick the top 5-8 most significant items across all sources
- papers: pick the top 3 most noteworthy papers, explain in plain English
- releases: include all from the input, summarize each
- If a section has no data, use an empty array
- significance is 1-5 (5 = most significant)
- Be direct and opinionated`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://ai.lfxai.dev',
      'X-Title': 'AI Pulse',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-haiku',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
  }

  const data: OpenRouterResponse = await response.json();
  const text = data.choices[0].message.content;
  const tokensUsed = data.usage.total_tokens;

  let jsonText = text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const briefing: BriefingResult = JSON.parse(jsonText);

  return { briefing, tokensUsed };
}
