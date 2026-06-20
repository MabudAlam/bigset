import { env } from "../env.js";
import { FETCH_TIMEOUT_MS } from "../fetch-timeout.js";

export interface QuickCrawlSearchOptions {
  query: string;
  timeRange?: "day" | "week" | "month" | "year";
  page?: number;
  useBm25?: boolean;
}

export interface QuickCrawlSearchResult {
  title: string;
  snippet: string;
  url: string;
}

export interface QuickCrawlSearchResponse {
  success: boolean;
  data?: {
    results: QuickCrawlSearchResult[];
  };
  error?: string;
}

export interface QuickCrawlScrapeOptions {
  url: string;
  formats?: string[];
  renderMode?: "auto" | "browser" | "http";
  waitFor?: number;
  cssSelector?: string;
}

export interface QuickCrawlScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    plainText?: string;
    links?: string[];
    title?: string;
    metadata?: {
      title?: string;
      description?: string;
      sourceURL?: string;
      language?: string;
      statusCode?: number;
      renderedMode?: string;
      timeTaken?: number;
    };
  };
  error?: string;
}

async function withFetchTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMessage: string,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await operation(controller.signal);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(timeoutMessage);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function quickcrawlSearch(
  options: QuickCrawlSearchOptions,
): Promise<QuickCrawlSearchResponse> {
  const { query, timeRange, page = 1, useBm25 = false } = options;
  const url = `${env.QUICKCRAWL_BASE_URL}/v1/search`;

  const body: Record<string, unknown> = {
    query,
    page,
    scrape: false,
  };
  if (timeRange) body.timeRange = timeRange;
  if (useBm25) body.use_bm25 = useBm25;

  return withFetchTimeout(
    async (signal) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok) {
        throw new Error(`QuickCrawl search API returned HTTP ${response.status}`);
      }

      const data = await response.json() as QuickCrawlSearchResponse;
      return data;
    },
    `QuickCrawl search timed out after ${FETCH_TIMEOUT_MS / 1000} seconds.`,
  );
}

export async function quickcrawlScrape(
  options: QuickCrawlScrapeOptions,
): Promise<QuickCrawlScrapeResponse> {
  const {
    url,
    formats = ["markdown"],
    renderMode = "auto",
    waitFor = 0,
    cssSelector,
  } = options;
  const apiUrl = `${env.QUICKCRAWL_BASE_URL}/v1/scrape`;

  const body: Record<string, unknown> = {
    url,
    formats,
    renderMode,
  };
  if (waitFor > 0) body.waitFor = waitFor;
  if (cssSelector) body.cssSelector = cssSelector;

  return withFetchTimeout(
    async (signal) => {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok) {
        throw new Error(`QuickCrawl scrape API returned HTTP ${response.status}`);
      }

      const data = await response.json() as QuickCrawlScrapeResponse;
      return data;
    },
    `QuickCrawl scrape timed out after ${FETCH_TIMEOUT_MS / 1000} seconds.`,
  );
}
