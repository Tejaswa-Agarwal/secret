'use client'

import AnimeCard from '@/components/AnimeCard'
import { Anime } from '@/types/anime'
import { useState, useEffect } from 'react'
import { searchAnime } from '@/lib/api'

export default function ClientHomePage({ initialAnime }: { initialAnime: Anime[] }) {
  const [anime, setAnime] = useState(initialAnime)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (value: string) => {
    setSearchTerm(value)
    if (!value.trim()) {
      setAnime(initialAnime)
      return
    }

    setLoading(true)
    try {
      const results = await searchAnime(value)
      setAnime(results)
    } catch (error) {
      console.error('Search failed:', error)
    }
    setLoading(false)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-900/30 to-black py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Welcome to AnimeHub
            </h1>
            <p className="mb-8 text-lg md:text-xl text-gray-300">
              Discover, stream, and enjoy thousands of anime titles
            </p>

            {/* Search Bar */}
            <div className="relative mx-auto max-w-md">
              <input
                type="text"
                placeholder="Search anime or genres..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-full bg-gray-900/50 border border-purple-500/30 px-6 py-3 text-white placeholder-gray-500 outline-none transition-all duration-300 hover:border-purple-500/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 transform">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Animated background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl animate-pulse" />
        </div>
      </section>

      {/* Anime Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {searchTerm ? `Search Results for "${searchTerm}"` : '🔥 Top Airing Anime'}
            </h2>
            <p className="text-gray-400">
              {loading ? 'Loading...' : `${anime.length} anime${anime.length === 1 ? '' : 's'} found`}
            </p>
          </div>

          {anime.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {anime.map((a) => (
                <AnimeCard key={a.id} anime={a} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-400 mb-4">
                {loading ? 'Searching...' : 'No anime found matching your search'}
              </p>
              {!loading && searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 to-pink-900/50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4 text-3xl md:text-4xl font-bold">Ready to start watching?</h2>
          <p className="mb-8 text-lg text-gray-300">Join millions of anime fans and start your journey today</p>
          <button className="bg-white hover:bg-gray-100 text-black font-bold px-8 py-4 rounded-full transition-colors duration-300 text-lg">
            Subscribe Now
          </button>
        </div>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
        </div>
      </section>
    </div>
  )
}
