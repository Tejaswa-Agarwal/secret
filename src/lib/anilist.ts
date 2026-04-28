const ANILIST_URL = 'https://graphql.anilist.co';

const MEDIA_FRAGMENT = `
  id
  title { romaji english native }
  description(asHtml: false)
  coverImage { extraLarge large medium color }
  bannerImage
  genres
  averageScore
  episodes
  status
  season
  seasonYear
  format
  studios(isMain: true) { nodes { name } }
  nextAiringEpisode { episode airingAt }
`;

async function query<T>(q: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: q, variables }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

export async function getTrendingAnime(page = 1, perPage = 20) {
  const q = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: TRENDING_DESC, type: ANIME, isAdult: false) { ${MEDIA_FRAGMENT} }
      }
    }
  `;
  const data = await query<{ Page: { media: AniListMedia[] } }>(q, { page, perPage });
  return data.Page.media;
}

export async function getPopularAnime(page = 1, perPage = 20) {
  const q = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) { ${MEDIA_FRAGMENT} }
      }
    }
  `;
  const data = await query<{ Page: { media: AniListMedia[] } }>(q, { page, perPage });
  return data.Page.media;
}

export async function getCurrentlyAiring(page = 1, perPage = 20) {
  const q = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(status: RELEASING, type: ANIME, isAdult: false, sort: POPULARITY_DESC) { ${MEDIA_FRAGMENT} }
      }
    }
  `;
  const data = await query<{ Page: { media: AniListMedia[] } }>(q, { page, perPage });
  return data.Page.media;
}

export async function getTopRated(page = 1, perPage = 20) {
  const q = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: SCORE_DESC, type: ANIME, isAdult: false, format_in: [TV, MOVIE]) { ${MEDIA_FRAGMENT} }
      }
    }
  `;
  const data = await query<{ Page: { media: AniListMedia[] } }>(q, { page, perPage });
  return data.Page.media;
}

export async function searchAnime(search: string, page = 1, perPage = 20, genre?: string) {
  const q = `
    query ($search: String, $page: Int, $perPage: Int, $genre: String) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: ANIME, isAdult: false, genre: $genre, sort: POPULARITY_DESC) { ${MEDIA_FRAGMENT} }
      }
    }
  `;
  const data = await query<{ Page: { media: AniListMedia[] } }>(q, { search: search || undefined, page, perPage, genre: genre || undefined });
  return data.Page.media;
}

export async function getAnimeById(id: number) {
  const q = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FRAGMENT}
        trailer { id site }
        recommendations(perPage: 8) {
          nodes { mediaRecommendation { ${MEDIA_FRAGMENT} } }
        }
        characters(perPage: 6, sort: ROLE) {
          nodes {
            name { full }
            image { large medium }
            gender
          }
        }
      }
    }
  `;
  const data = await query<{ Media: AniListMedia }>(q, { id });
  return data.Media;
}

export interface AniListMedia {
  id: number;
  title: { romaji: string; english?: string; native?: string };
  description?: string;
  coverImage: { extraLarge?: string; large?: string; medium?: string; color?: string };
  bannerImage?: string;
  genres: string[];
  averageScore?: number;
  episodes?: number;
  status?: string;
  season?: string;
  seasonYear?: number;
  format?: string;
  studios?: { nodes: { name: string }[] };
  nextAiringEpisode?: { episode: number; airingAt: number };
  trailer?: { id: string; site: string };
  recommendations?: { nodes: { mediaRecommendation: AniListMedia }[] };
  characters?: { nodes: { name: { full: string }; image: { large?: string; medium?: string }; gender?: string }[] };
}
