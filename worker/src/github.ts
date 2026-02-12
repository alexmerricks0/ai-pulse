/**
 * GitHub Releases client
 * Tracks releases from major AI repos
 */

export interface GitHubRelease {
  repo: string;
  tag: string;
  title: string;
  publishedAt: string;
  url: string;
}

const TRACKED_REPOS = [
  'openai/openai-python',
  'anthropics/anthropic-sdk-python',
  'huggingface/transformers',
  'ollama/ollama',
  'langchain-ai/langchain',
  'vllm-project/vllm',
  'ggml-org/llama.cpp',
  'run-llama/llama_index',
  'microsoft/autogen',
  'crewAIInc/crewAI',
];

interface GitHubReleaseResponse {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
}

export async function fetchGitHubReleases(token?: string): Promise<GitHubRelease[]> {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ai-pulse-worker',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const results = await Promise.allSettled(
    TRACKED_REPOS.map(async (repo) => {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/releases?per_page=3`,
        { headers },
      );

      if (!response.ok) return [];

      const releases = await response.json<GitHubReleaseResponse[]>();
      return releases
        .filter((r) => r.published_at > cutoff)
        .map((r) => ({
          repo,
          tag: r.tag_name,
          title: r.name || r.tag_name,
          publishedAt: r.published_at,
          url: r.html_url,
        }));
    }),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<GitHubRelease[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);
}
