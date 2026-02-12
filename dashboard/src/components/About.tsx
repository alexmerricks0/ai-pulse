export function About() {
  return (
    <div className="py-8 max-w-2xl">
      <h2 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-6 flex items-center gap-3">
        About
        <span className="flex-1 h-px bg-border" />
      </h2>

      <p className="text-lg text-text leading-relaxed font-light mb-6">
        <strong className="text-white font-medium">AI Pulse</strong> is a daily
        intelligence briefing on the AI/ML industry. Every morning at 07:00 UTC,
        a Cloudflare Worker aggregates news from three sources, sends them to
        Claude for synthesis, and publishes a structured briefing.
      </p>

      <h3 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4 mt-8">
        Data Sources
      </h3>

      <div className="space-y-4 mb-8">
        {[
          { name: 'Hacker News', desc: 'AI-filtered top stories from the developer community', color: 'text-orange-400' },
          { name: 'arXiv', desc: 'Latest CS.AI and CS.LG papers with plain-English summaries', color: 'text-red-400' },
          { name: 'GitHub Releases', desc: 'New versions from major AI frameworks and tools', color: 'text-blue-400' },
        ].map((source) => (
          <div key={source.name} className="flex gap-3">
            <span className={`font-mono text-xs font-medium flex-shrink-0 mt-0.5 ${source.color}`}>
              {source.name}
            </span>
            <span className="text-sm text-text-secondary">{source.desc}</span>
          </div>
        ))}
      </div>

      <h3 className="font-mono text-xs uppercase tracking-widest text-text-dim mb-4 mt-8">
        How it works
      </h3>

      <ol className="space-y-3 mb-8">
        {[
          'Cron trigger fires daily at 07:00 UTC',
          'Worker fetches from Hacker News, arXiv, and GitHub in parallel',
          'Claude Haiku synthesizes a structured daily briefing',
          'Briefing is stored in Cloudflare D1',
          'This dashboard reads from the Worker API',
        ].map((step, i) => (
          <li key={i} className="flex gap-3 text-text-secondary">
            <span className="font-mono text-xs text-accent flex-shrink-0 mt-0.5">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-sm">{step}</span>
          </li>
        ))}
      </ol>

      <div className="border-t border-border pt-6 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <dt className="font-mono text-xs uppercase tracking-widest text-text-dim mb-1">Stack</dt>
          <dd className="text-sm text-text-secondary">
            Cloudflare Workers, D1, Pages, React, TypeScript
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-widest text-text-dim mb-1">AI</dt>
          <dd className="text-sm text-text-secondary">Claude Haiku via OpenRouter</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-widest text-text-dim mb-1">Source</dt>
          <dd className="text-sm text-text-secondary">
            <a
              href="https://github.com/alexmerricks0/ai-pulse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              GitHub
            </a>
          </dd>
        </div>
      </div>
    </div>
  );
}
