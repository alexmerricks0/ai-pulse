import type { StoryItem } from '../api';

interface StoryCardProps {
  stories: StoryItem[];
  loading?: boolean;
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  hackernews: { label: 'HN', color: 'text-orange-400' },
  arxiv: { label: 'arXiv', color: 'text-red-400' },
  github: { label: 'GitHub', color: 'text-blue-400' },
};

function SignificanceDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < level ? 'bg-accent' : 'bg-border-accent'
          }`}
        />
      ))}
    </div>
  );
}

export function StoryCard({ stories, loading }: StoryCardProps) {
  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4 flex items-center gap-3">
          Top Stories
          <span className="flex-1 h-px bg-border" />
        </h2>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-raised rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4 flex items-center gap-3">
        Top Stories ({stories.length})
        <span className="flex-1 h-px bg-border" />
      </h2>

      <div className="space-y-3">
        {stories.map((story, i) => {
          const source = SOURCE_LABELS[story.source] || { label: story.source, color: 'text-text-dim' };

          return (
            <a
              key={i}
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-surface border border-border rounded-xl px-5 py-4 hover:border-border-accent transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-xs font-medium ${source.color}`}>
                      {source.label}
                    </span>
                    <SignificanceDots level={story.significance} />
                  </div>
                  <h3 className="text-text text-sm font-medium group-hover:text-white transition-colors mb-1">
                    {story.title}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {story.summary}
                  </p>
                </div>
                <svg className="w-4 h-4 text-text-dim flex-shrink-0 mt-1 group-hover:text-text-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
