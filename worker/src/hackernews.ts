/**
 * Hacker News API client
 * Fetches top stories and filters for AI/ML content
 */

export interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
}

const AI_KEYWORDS = [
  'ai', 'ml', 'llm', 'gpt', 'claude', 'llama', 'gemini', 'mistral',
  'transformer', 'neural', 'openai', 'anthropic', 'deep learning',
  'machine learning', 'artificial intelligence', 'diffusion', 'fine-tune',
  'benchmark', 'embedding', 'rag', 'agent', 'copilot', 'chatbot',
  'foundation model', 'language model', 'generative', 'inference',
  'hugging face', 'stable diffusion', 'midjourney', 'deepseek',
];

export async function fetchHNStories(): Promise<HNStory[]> {
  const topIds = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then((r) => r.json<number[]>());

  const top30 = topIds.slice(0, 30);

  const stories = await Promise.all(
    top30.map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        .then((r) => r.json<HNStory>()),
    ),
  );

  return stories
    .filter((s) => s && s.title && isAIRelated(s.title))
    .map((s) => ({
      id: s.id,
      title: s.title,
      url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
      score: s.score,
      by: s.by,
      time: s.time,
      descendants: s.descendants || 0,
    }));
}

function isAIRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return AI_KEYWORDS.some((kw) => lower.includes(kw));
}
