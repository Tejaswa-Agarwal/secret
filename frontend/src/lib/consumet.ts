/**
 * Episode list provider - dual source:
 *
 * PRIMARY:  Jikan (api.jikan.moe) — official MAL unofficial API
 *           Fast, reliable, up to 100 eps per page, paginates automatically
 *           Uses MAL ID (idMal from AniList)
 *
 * FALLBACK: AniZip (api.ani.zip) — rich episode data with thumbnails
 *           Uses AniList ID
 *
 * STREAMING: All done via embed iframes in VideoPlayer (vidsrc etc)
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

// ─── Jikan ────────────────────────────────────────────────────────────────────

interface JikanEpisode {
  mal_id: number;
  title?: string;
  aired?: string;
  filler?: boolean;
  recap?: boolean;
}

interface JikanResponse {
  data: JikanEpisode[];
  pagination: { has_next_page: boolean; last_visible_page: number };
}

async function fetchJikanPage(malId: number, page: number): Promise<JikanResponse> {
  const res = await fetch(
    `https://api.jikan.moe/v4/anime/${malId}/episodes?page=${page}`,
    { signal: AbortSignal.timeout(8000), next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`Jikan ${res.status}`);
  return res.json();
}

async function getEpisodesFromJikan(malId: number): Promise<ConsumetEpisode[]> {
  const first = await fetchJikanPage(malId, 1);
  let allEps: JikanEpisode[] = [...first.data];

  // Fetch remaining pages in parallel (cap at 10 pages = 1000 eps)
  if (first.pagination.has_next_page) {
    const totalPages = Math.min(first.pagination.last_visible_page, 10);
    const pageNums = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);

    // Jikan has a rate limit — fetch in small batches with delay
    const batches: number[][] = [];
    for (let i = 0; i < pageNums.length; i += 3) {
      batches.push(pageNums.slice(i, i + 3));
    }
    for (const batch of batches) {
      const results = await Promise.allSettled(
        batch.map(p => fetchJikanPage(malId, p))
      );
      for (const r of results) {
        if (r.status === 'fulfilled') allEps = allEps.concat(r.value.data);
      }
      // Small delay between batches to respect rate limit
      if (batch !== batches[batches.length - 1]) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
  }

  return allEps.map(ep => ({
    id: `ep-${ep.mal_id}`,
    number: ep.mal_id,
    title: ep.title ?? undefined,
    airDate: ep.aired ?? undefined,
    isFiller: ep.filler ?? false,
  }));
}

// ─── AniZip ───────────────────────────────────────────────────────────────────

interface AniZipEpisode {
  episodeNumber: number;
  title?: { en?: string; 'x-jat'?: string };
  overview?: string;
  image?: string;
  airDate?: string;
}

async function getEpisodesFromAniZip(anilistId: number): Promise<ConsumetEpisode[]> {
  const res = await fetch(
    `https://api.ani.zip/mappings?anilist_id=${anilistId}`,
    { signal: AbortSignal.timeout(8000), next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`AniZip ${res.status}`);
  const data = await res.json() as { episodes?: Record<string, AniZipEpisode> };
  const eps = data.episodes ?? {};
  return Object.entries(eps)
    .filter(([k]) => !isNaN(parseInt(k)))
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([, ep]) => ({
      id: `ep-${ep.episodeNumber}`,
      number: ep.episodeNumber,
      title: ep.title?.en ?? ep.title?.['x-jat'] ?? undefined,
      description: ep.overview ?? undefined,
      image: ep.image ?? undefined,
      airDate: ep.airDate ?? undefined,
    }));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch episode list.
 * @param anilistId  The AniList ID (always available)
 * @param malId      MAL ID (preferred — faster via Jikan)
 */
export async function getEpisodes(
  anilistId: number,
  malId?: number
): Promise<ConsumetEpisode[]> {
  // Try Jikan first (fast, reliable, uses MAL ID)
  if (malId) {
    try {
      const eps = await getEpisodesFromJikan(malId);
      if (eps.length > 0) return eps;
    } catch {
      // fall through to AniZip
    }
  }

  // Fallback: AniZip (uses AniList ID, has thumbnails/descriptions)
  try {
    const eps = await getEpisodesFromAniZip(anilistId);
    if (eps.length > 0) return eps;
  } catch {
    // all failed
  }

  return [];
}

/**
 * Streaming is handled purely by embed iframes in VideoPlayer.
 * This stub exists to satisfy any remaining imports.
 */
export async function getStreamingSources(): Promise<ConsumetStreamResult> {
  return { sources: [] };
}
