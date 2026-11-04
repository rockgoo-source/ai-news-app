import Parser from "rss-parser";

export const RSS_SOURCES = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
] as const;

export const WINDOW_MS = 24 * 60 * 60 * 1000;

export type FeedArticle = {
  source: string;
  url: string;
  originalTitle: string;
  publishedAt: Date;
  // Claude 요약용 RSS 본문 발췌(저장하지 않음)
  snippet: string;
};

const SNIPPET_MAX = 1500;

export type FetchResult = {
  articles: FeedArticle[];
  failedSources: string[];
};

const parser = new Parser({ timeout: 10_000 });

async function fetchSource(
  source: (typeof RSS_SOURCES)[number],
  since: Date,
): Promise<FeedArticle[]> {
  const feed = await parser.parseURL(source.url);
  const result: FeedArticle[] = [];

  for (const item of feed.items) {
    const url = item.link ?? item.guid;
    const title = item.title?.trim();
    const dateStr = item.isoDate ?? item.pubDate;
    if (!url || !title || !dateStr) continue;

    const publishedAt = new Date(dateStr);
    if (Number.isNaN(publishedAt.getTime()) || publishedAt < since) continue;

    const snippet = (item.contentSnippet ?? item.content ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, SNIPPET_MAX);

    result.push({
      source: source.name,
      url,
      originalTitle: title,
      publishedAt,
      snippet,
    });
  }
  return result;
}

// 모든 소스에서 최근 24시간 기사를 병렬로 가져온다. 일부 소스가 실패해도 나머지는 반환한다.
export async function fetchRecentArticles(
  now: Date = new Date(),
): Promise<FetchResult> {
  const since = new Date(now.getTime() - WINDOW_MS);
  const settled = await Promise.allSettled(
    RSS_SOURCES.map((s) => fetchSource(s, since)),
  );

  const articles: FeedArticle[] = [];
  const failedSources: string[] = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") articles.push(...r.value);
    else failedSources.push(RSS_SOURCES[i].name);
  });
  return { articles, failedSources };
}
