import type { PaperItem } from '../api';

interface PapersSectionProps {
  papers: PaperItem[];
  loading?: boolean;
}

export function PapersSection({ papers, loading }: PapersSectionProps) {
  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4 flex items-center gap-3">
          Notable Papers
          <span className="flex-1 h-px bg-border" />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-surface-raised rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (papers.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4 flex items-center gap-3">
        Notable Papers
        <span className="flex-1 h-px bg-border" />
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {papers.map((paper, i) => (
          <a
            key={i}
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface border border-border rounded-xl px-5 py-4 hover:border-border-accent transition-colors group flex flex-col"
          >
            <span className="font-mono text-xs text-red-400 mb-2">arXiv</span>
            <h3 className="text-text text-sm font-medium group-hover:text-white transition-colors mb-2 line-clamp-2">
              {paper.title}
            </h3>
            <p className="text-text-dim text-xs mb-3">{paper.authors}</p>
            <p className="text-text-secondary text-sm flex-1">
              {paper.summary}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
