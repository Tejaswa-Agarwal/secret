import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trending - AnimeHub',
  description: 'Check out the trending anime on AnimeHub',
}

export default function TrendingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-4">Trending Now</h1>
      <p className="text-gray-400 mb-8">Coming soon! Discover what's trending in the anime community.</p>
    </div>
  )
}
