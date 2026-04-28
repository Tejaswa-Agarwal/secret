/**
 * Anime episode & streaming source fetcher.
 *
 * Strategy (in order):
 *  1. META.Anilist from @consumet/extensions — scrapes episode list + stream URLs
 *     using Hianime/AnimePahe providers under the hood (same as Anikai/Aniyomi)
 *  2. Fallback: REST Consumet public instance if scraper times out
 *
 * The VideoPlayer component also has 2embed + VidSrc iframe fallbacks
 * which are the most reliable for end users.
 */

export interface ConsumetEpisode {
  id: string;
  number: number;
  title?: string;
  description?: string;
  image?: string;
  airDate?: string;
}

export interface ConsumetSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface ConsumetStreamResult {
  sources: ConsumetSource[];
  subtitles?: { url: string; lang: string }[];
  headers?: Record<string, string>;
}

const CONSUMET_FALLBACK = 'https://consumet-api.onrender.com';

/** Helper: call Consumet public REST API as fallback */
async function restFetch(path: string): Promise<unknown> {
  const res = await fetch(`${CONSUMET_FALLBACK}${path}`, {
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`REST ${res.status}`);
  return res.json();
}

/**
 * Fetch episode list for an anime by AniList ID.
 * Uses @consumet/extensions META.Anilist scraper (Hianime provider),
 * with REST fallback.
 */
export async function getEpisodes(anilistId: number): Promise<ConsumetEpisode[]> {
  // Try scraper first
  try {
    const { META } = await import('@consumet/extensions');
    const anilist = new META.Anilist();
    const info = await Promise.race([
      anilist.fetchAnimeInfo(String(anilistId)),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
    ]) as { episodes?: ConsumetEpisode[] };
    if (info?.episodes?.length) {
      return info.episodes.map((ep: ConsumetEpisode) => ({
        id: ep.id,
        number: ep.number,
        title: ep.title ?? undefined,
        description: ep.description ?? undefined,
        image: ep.image ?? undefined,
        airDate: ep.airDate ?? undefined,
      }));
    }
  } catch {
    // fall through to REST
  }

  // REST fallback
  try {
    const data = await restFetch(`/meta/anilist/episodes/${anilistId}`) as ConsumetEpisode[] | { episodes?: ConsumetEpisode[] };
    if (Array.isArray(data)) return data;
    if ('episodes' in data && Array.isArray(data.episodes)) return data.episodes;
  } catch {
    // all failed
  }

  return [];
}

/**
 * Fetch streaming sources for an episode ID.
 * Same scraper → REST fallback chain.
 */
export async function getStreamingSources(episodeId: string): Promise<ConsumetStreamResult> {
  // Try @consumet/extensions META.Anilist scraper
  try {
    const { META } = await import('@consumet/extensions');
    const anilist = new META.Anilist();
    const data = await Promise.race([
      anilist.fetchEpisodeSources(episodeId),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
    ]) as { sources?: ConsumetSource[]; subtitles?: { url: string; lang: string }[]; headers?: Record<string, string> };

    if (data?.sources?.length) {
      return {
        sources: data.sources.map((s: ConsumetSource) => ({
          url: s.url,
          quality: s.quality ?? 'default',
          isM3U8: s.isM3U8 ?? s.url.includes('.m3u8'),
        })),
        subtitles: data.subtitles,
        headers: data.headers,
      };
    }
  } catch {
    // fall through
  }

  // REST fallback
  try {
    const data = await restFetch(`/meta/anilist/watch/${encodeURIComponent(episodeId)}`) as ConsumetStreamResult;
    if (data?.sources?.length) return data;
  } catch {
    // all failed
  }

  return { sources: [] };
}
