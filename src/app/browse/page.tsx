import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Anime - AnimeHub',
  description: 'Browse and discover all anime available on AnimeHub',
}

export default function BrowsePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-4">Browse Anime</h1>
      <p className="text-gray-400 mb-8">Coming soon! Explore our full anime catalog.</p>
    </div>
  )
}
