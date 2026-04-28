// Consumet REST API wrapper
// Primary: https://api.consumet.org
// Fallback: https://consumet-api.onrender.com

const CONSUMET_BASES = [
  'https://api.consumet.org',
  'https://consumet-api.onrender.com',
];

async function consumetFetch(path: string): Promise<unknown> {
  for (const base of CONSUMET_BASES) {
    try {
      const res = await fetch(`${base}${path}`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return await res.json();
    } catch {
      // try next base
    }
  }
  throw new Error(`Consumet API unavailable for: ${path}`);
}

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

// Get episodes for an anime by its AniList ID (uses meta/anilist provider)
export async function getEpisodes(anilistId: number): Promise<ConsumetEpisode[]> {
  try {
    const data = await consumetFetch(`/meta/anilist/episodes/${anilistId}`) as { episodes?: ConsumetEpisode[] } | ConsumetEpisode[];
    if (Array.isArray(data)) return data;
    if ('episodes' in data && Array.isArray((data as { episodes?: ConsumetEpisode[] }).episodes)) return (data as { episodes: ConsumetEpisode[] }).episodes;
    return [];
  } catch {
    return [];
  }
}

// Get streaming sources for an episode ID (from gogoanime)
export async function getStreamingSources(episodeId: string): Promise<ConsumetStreamResult> {
  try {
    const data = await consumetFetch(`/meta/anilist/watch/${encodeURIComponent(episodeId)}`) as ConsumetStreamResult;
    return data;
  } catch {
    return { sources: [] };
  }
}

// Search anime by name via Consumet (gogoanime)
export async function searchConsumet(query: string): Promise<{ id: string; title: string; image?: string }[]> {
  try {
    const data = await consumetFetch(`/anime/gogoanime/${encodeURIComponent(query)}`) as { results?: { id: string; title: string; image?: string }[] };
    return data?.results ?? [];
  } catch {
    return [];
  }
}
