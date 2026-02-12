import type { ReleaseItem } from '../api';

interface ReleasesSectionProps {
  releases: ReleaseItem[];
  loading?: boolean;
}

export function ReleasesSection({ releases, loading }: ReleasesSectionProps) {
  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4 flex items-center gap-3">
          Releases
          <span className="flex-1 h-px bg-border" />
        </h2>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-raised rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (releases.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4 flex items-center gap-3">
        Releases ({releases.length})
        <span className="flex-1 h-px bg-border" />
      </h2>

      <div className="space-y-3">
        {releases.map((release, i) => (
          <a
            key={i}
            href={release.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 bg-surface border border-border rounded-xl px-5 py-4 hover:border-border-accent transition-colors group"
          >
            <div className="flex-shrink-0 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-accent">{release.repo}</span>
                <span className="font-mono text-xs text-text-dim">{release.version}</span>
              </div>
              <p className="text-text-secondary text-sm">{release.summary}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
