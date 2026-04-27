import { animeData } from '@/data/anime'
import { notFound } from 'next/navigation'
import ClientAnimeContent from '@/components/ClientAnimeContent'

export function generateStaticParams() {
  return animeData.map((anime) => ({
    id: anime.id.toString(),
  }))
}

export default function AnimePage({ params }: { params: { id: string } }) {
  const anime = animeData.find((a) => a.id === parseInt(params.id))

  if (!anime) {
    notFound()
  }

  return <ClientAnimeContent anime={anime} />
}
