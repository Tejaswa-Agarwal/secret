'use client'

import Link from 'next/link'
import { Anime } from '@/types/anime'

export default function AnimeCard({ anime }: { anime: Anime }) {
  return (
    <Link href={`/anime/${anime.id}`}>
      <div className="group relative h-full cursor-pointer overflow-hidden rounded-lg bg-gradient-to-b from-gray-900 to-black transition-transform duration-300 hover:scale-105">
        {/* Image */}
        <div className="relative h-64 w-full overflow-hidden bg-gradient-to-b from-purple-500 to-pink-500">
          <img
            src={anime.image}
            alt={anime.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 truncate text-lg font-bold text-white group-hover:text-purple-400">
            {anime.title}
          </h3>

          {/* Rating and Status */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm font-semibold text-yellow-400">{anime.rating}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              anime.status === 'Ongoing'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {anime.status}
            </span>
          </div>

          {/* Genres */}
          <div className="mb-2 flex flex-wrap gap-1">
            {anime.genre.slice(0, 2).map((g) => (
              <span key={g} className="inline-block bg-purple-500/20 px-2 py-1 text-xs text-purple-300 rounded">
                {g}
              </span>
            ))}
          </div>

          {/* Episodes */}
          <div className="text-xs text-gray-400">
            📺 {anime.episodes} Episodes • {anime.year}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </Link>
  )
}
