const API_BASE = (() => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url;
  if (import.meta.env.DEV) return 'http://localhost:8787';
  console.error('VITE_API_URL must be set in production builds');
  return '';
})();

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

export interface DailyBriefing {
  date: string;
  briefing: BriefingResult;
  tokensUsed: number;
  createdAt: string;
}

export interface HistoryItem {
  date: string;
  headline: string;
  trend: string;
  storyCount: number;
  paperCount: number;
}

export async function fetchToday(): Promise<DailyBriefing> {
  const res = await fetch(`${API_BASE}/api/today`);
  if (!res.ok) throw new Error("Failed to fetch today's briefing");
  return res.json();
}

export async function fetchByDate(date: string): Promise<DailyBriefing> {
  const res = await fetch(`${API_BASE}/api/date/${date}`);
  if (!res.ok) throw new Error(`Failed to fetch briefing for ${date}`);
  return res.json();
}

export async function fetchHistory(days = 30): Promise<{ data: HistoryItem[] }> {
  const res = await fetch(`${API_BASE}/api/history?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function subscribe(email: string): Promise<{ status?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/api/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}
