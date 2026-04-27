export interface JikanAnime {
  mal_id: number
  title: string
  images: {
    jpg: {
      image_url: string
    }
  }
  score: number
  episodes: number
  status: string
  aired?: {
    from: string
  }
  genres: Array<{ name: string }>
  synopsis: string
}

export interface Anime {
  id: number
  title: string
  image: string
  rating: number
  episodes: number
  status: 'Ongoing' | 'Completed'
  genre: string[]
  year: number
  synopsis: string
}

function parseYear(date: string): number {
  if (!date) return new Date().getFullYear()
  try {
    return parseInt(date.split('-')[0]) || new Date().getFullYear()
  } catch {
    return new Date().getFullYear()
  }
}

export async function fetchTopAnime(): Promise<Anime[]> {
  try {
    const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&limit=25', {
      next: { revalidate: 3600 },
    })

    if (!response.ok) throw new Error('Failed to fetch')

    const data = await response.json()
    
    return data.data.map((anime: JikanAnime) => ({
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.image_url,
      rating: anime.score || 0,
      episodes: anime.episodes || 0,
      status: anime.status === 'Currently Airing' ? 'Ongoing' : 'Completed',
      genre: anime.genres?.map((g: { name: string }) => g.name) || [],
      year: anime.aired?.from ? parseYear(anime.aired.from) : new Date().getFullYear(),
      synopsis: anime.synopsis || 'No synopsis available',
    }))
  } catch (error) {
    console.error('Error fetching anime:', error)
    return []
  }
}

export async function searchAnime(query: string): Promise<Anime[]> {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?query=${encodeURIComponent(query)}&limit=25`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) throw new Error('Failed to search')

    const data = await response.json()
    
    return data.data.map((anime: JikanAnime) => ({
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.image_url,
      rating: anime.score || 0,
      episodes: anime.episodes || 0,
      status: anime.status === 'Currently Airing' ? 'Ongoing' : 'Completed',
      genre: anime.genres?.map((g: { name: string }) => g.name) || [],
      year: anime.aired?.from ? parseYear(anime.aired.from) : new Date().getFullYear(),
      synopsis: anime.synopsis || 'No synopsis available',
    }))
  } catch (error) {
    console.error('Error searching anime:', error)
    return []
  }
}

export async function getAnimeById(id: number): Promise<Anime | null> {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) throw new Error('Failed to fetch anime')

    const data = await response.json()
    const anime = data.data

    return {
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.image_url,
      rating: anime.score || 0,
      episodes: anime.episodes || 0,
      status: anime.status === 'Currently Airing' ? 'Ongoing' : 'Completed',
      genre: anime.genres?.map((g: { name: string }) => g.name) || [],
      year: anime.aired?.from ? parseYear(anime.aired.from) : new Date().getFullYear(),
      synopsis: anime.synopsis || 'No synopsis available',
    }
  } catch (error) {
    console.error('Error fetching anime:', error)
    return null
  }
}
