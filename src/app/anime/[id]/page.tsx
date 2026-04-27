'use client'

import { animeData } from '@/data/anime'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function AnimePage({ params }: { params: { id: string } }) {
  const [isFavorited, setIsFavorited] = useState(false)
  const anime = animeData.find((a) => a.id === parseInt(params.id))

  if (!anime) {
    notFound()
  }

  return (
    <div>
      {/* Header with background */}
      <div className="relative h-64 md:h-96 overflow-hidden bg-gradient-to-b from-purple-600 to-black">
        <img
          src={anime.image}
          alt={anime.title}
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />

        {/* Back button */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 bg-black/50 hover:bg-black/70 backdrop-blur px-4 py-2 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Poster */}
          <div className="md:col-span-1">
            <div className="rounded-lg overflow-hidden shadow-2xl border border-purple-500/20">
              <img
                src={anime.image}
                alt={anime.title}
                className="w-full h-auto"
              />
            </div>
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`mt-4 w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                isFavorited
                  ? 'bg-red-500/20 text-red-400 border border-red-500'
                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30'
              }`}
            >
              {isFavorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
            </button>
          </div>

          {/* Details */}
          <div className="md:col-span-3">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {anime.title}
            </h1>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900/50 backdrop-blur p-4 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-sm mb-1">Rating</p>
                <p className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                  ⭐ {anime.rating}
                </p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur p-4 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-sm mb-1">Episodes</p>
                <p className="text-2xl font-bold text-purple-400">📺 {anime.episodes}</p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur p-4 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <p className={`text-xl font-bold ${anime.status === 'Ongoing' ? 'text-green-400' : 'text-blue-400'}`}>
                  {anime.status}
                </p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur p-4 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-sm mb-1">Year</p>
                <p className="text-2xl font-bold text-pink-400">{anime.year}</p>
              </div>
            </div>

            {/* Genres */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {anime.genre.map((g) => (
                  <span
                    key={g}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-full text-purple-300 text-sm font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all cursor-pointer"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed text-lg">{anime.synopsis}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-lg transition-all duration-300 text-lg">
                ▶️ Watch Now
              </button>
              <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-lg transition-all duration-300 text-lg">
                📺 Watch Trailer
              </button>
            </div>
          </div>
        </div>

        {/* Related Anime */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {animeData
              .filter((a) => a.id !== anime.id && a.genre.some((g) => anime.genre.includes(g)))
              .slice(0, 4)
              .map((relatedAnime) => (
                <Link key={relatedAnime.id} href={`/anime/${relatedAnime.id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg h-64 bg-gradient-to-b from-purple-500 to-pink-500 mb-3">
                      <img
                        src={relatedAnime.image}
                        alt={relatedAnime.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                      {relatedAnime.title}
                    </h3>
                    <p className="text-sm text-gray-400">⭐ {relatedAnime.rating}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
