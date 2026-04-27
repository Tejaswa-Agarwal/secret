import AnimeCard from '@/components/AnimeCard'
import ClientHomePage from '@/components/ClientHomePage'
import { fetchTopAnime } from '@/lib/api'

export default async function Home() {
  const anime = await fetchTopAnime()

  return <ClientHomePage initialAnime={anime} />
}
