/**
 * arXiv API client
 * Fetches recent CS.AI and CS.LG papers via Atom feed
 */

export interface ArxivPaper {
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  published: string;
}

export async function fetchArxivPapers(): Promise<ArxivPaper[]> {
  const query = encodeURIComponent('cat:cs.AI OR cat:cs.LG');
  const url = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=20`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`arXiv API error ${response.status}`);
  }

  const xml = await response.text();
  return parseAtomFeed(xml);
}

function parseAtomFeed(xml: string): ArxivPaper[] {
  const papers: ArxivPaper[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];

    const title = extractTag(entry, 'title')?.replace(/\s+/g, ' ').trim();
    const abstract = extractTag(entry, 'summary')?.replace(/\s+/g, ' ').trim();
    const id = extractTag(entry, 'id');
    const published = extractTag(entry, 'published');

    const authors: string[] = [];
    const authorRegex = /<author>\s*<name>([^<]+)<\/name>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(entry)) !== null) {
      authors.push(authorMatch[1].trim());
    }

    if (title && id) {
      papers.push({
        title,
        authors,
        abstract: abstract || '',
        url: id,
        published: published || '',
      });
    }
  }

  return papers;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`);
  const match = regex.exec(xml);
  return match ? match[1] : null;
}
