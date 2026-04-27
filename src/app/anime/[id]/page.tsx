import { getAnimeById, fetchTopAnime } from '@/lib/api'
import { notFound } from 'next/navigation'
import ClientAnimeContent from '@/components/ClientAnimeContent'

export async function generateStaticParams() {
  const anime = await fetchTopAnime()
  return anime.map((a) => ({
    id: a.id.toString(),
  }))
}

export default async function AnimePage({ params }: { params: { id: string } }) {
  const anime = await getAnimeById(parseInt(params.id))

  if (!anime) {
    notFound()
  }

  return <ClientAnimeContent anime={anime} />
}
