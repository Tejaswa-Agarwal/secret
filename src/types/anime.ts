export type Anime = {
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
