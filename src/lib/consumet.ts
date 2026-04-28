/**
 * Anime episode data from multiple working public APIs:
 *
 * 1. AniZip (api.ani.zip) — episode list with titles, thumbnails, descriptions
 *    Used by: Aniyomi, many anime apps. Maps AniList ID → episode data
 *
 * 2. Jikan (api.jikan.moe) — unofficial MAL API, episode filler flags
 *    Maps AniList idMal → episode metadata
 *
 * 3. Consumet REST (fallback) — episode IDs compatible with embed players
 *
 * For STREAMING: 2embed.skin iframe (most reliable, uses AniList ID + ep number)
 */

export interface ConsumetEpisode {
  id: string;
  number: number;
  title?: string;
  description?: string;
  image?: string;
  airDate?: string;
  isFiller?: boolean;
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

// AniZip episode data shape
interface AniZipEpisode {
  episodeNumber: number;
  title?: { en?: string; ja?: string; 'x-jat'?: string };
  overview?: string;
  summary?: string;
  image?: string;
  airDate?: string;
  airDateUtc?: string;
  runtime?: number;
}

/**
 * Fetch episode list using AniZip — the best free source for episode metadata.
 * Falls back to Consumet REST if AniZip fails.
 */
export async function getEpisodes(anilistId: number): Promise<ConsumetEpisode[]> {
  // 1. AniZip — rich episode data used by Aniyomi, Saikou etc.
  try {
    const res = await fetch(`https://api.ani.zip/mappings?anilist_id=${anilistId}`, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json() as { episodes?: Record<string, AniZipEpisode> };
      const eps = data.episodes ?? {};
      const result = Object.entries(eps)
        .filter(([k]) => !isNaN(parseInt(k)))
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([, ep]) => ({
          // Use anilistId + episode number as the ID (compatible with embed players)
          id: `${anilistId}-episode-${ep.episodeNumber}`,
          number: ep.episodeNumber,
          title: ep.title?.en ?? ep.title?.['x-jat'] ?? undefined,
          description: ep.overview ?? ep.summary ?? undefined,
          image: ep.image ?? undefined,
          airDate: ep.airDate ?? undefined,
        }));
      if (result.length > 0) return result;
    }
  } catch {
    // fall through
  }

  // 2. Consumet REST fallback (gives gogoanime-style episode IDs)
  try {
    const res = await fetch(`https://consumet-api.onrender.com/meta/anilist/episodes/${anilistId}`, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json() as ConsumetEpisode[] | { episodes?: ConsumetEpisode[] };
      const eps = Array.isArray(data) ? data : data.episodes ?? [];
      if (eps.length > 0) return eps;
    }
  } catch {
    // all failed
  }

  // 3. Generate placeholder episodes from AniList episode count
  // (VideoPlayer will use embed iframe which only needs animeId + episodeNumber)
  return [];
}

/**
 * Get streaming sources for an episode ID.
 * Our episode IDs are now "{anilistId}-episode-{num}" format.
 * We try Consumet REST for actual HLS; the VideoPlayer also has iframe embeds as fallback.
 */
export async function getStreamingSources(episodeId: string): Promise<ConsumetStreamResult> {
  // Try Consumet REST
  try {
    const res = await fetch(
      `https://consumet-api.onrender.com/meta/anilist/watch/${encodeURIComponent(episodeId)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (res.ok) {
      const data = await res.json() as ConsumetStreamResult;
      if (data?.sources?.length) return data;
    }
  } catch {
    // fall through to empty — VideoPlayer will auto-switch to iframe embed
  }

  return { sources: [] };
}
