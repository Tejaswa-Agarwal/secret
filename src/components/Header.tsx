'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-gradient-to-b from-black via-gray-900 to-transparent backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-pink-300 transition-colors">
              🎬 AnimeHub
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-300 hover:text-purple-400 transition-colors font-medium">
              Home
            </Link>
            <Link href="/browse" className="text-gray-300 hover:text-purple-400 transition-colors font-medium">
              Browse
            </Link>
            <Link href="/trending" className="text-gray-300 hover:text-purple-400 transition-colors font-medium">
              Trending
            </Link>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-full transition-all duration-300">
              Sign In
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-purple-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block text-gray-300 hover:text-purple-400 py-2">
              Home
            </Link>
            <Link href="/browse" className="block text-gray-300 hover:text-purple-400 py-2">
              Browse
            </Link>
            <Link href="/trending" className="block text-gray-300 hover:text-purple-400 py-2">
              Trending
            </Link>
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-6 py-2 rounded-full">
              Sign In
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
