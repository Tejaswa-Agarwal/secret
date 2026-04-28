'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';
import type { AniListMedia } from '@/lib/anilist';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mecha', 'Music', 'Mystery', 'Psychological',
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';

  const [results, setResults] = useState<AniListMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(q);
  const [activeGenre, setActiveGenre] = useState(genre);

  const fetchResults = useCallback(async (query: string, g: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (g) params.set('genre', g);
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(q, genre);
    setSearch(q);
    setActiveGenre(genre);
  }, [q, genre, fetchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (activeGenre) params.set('genre', activeGenre);
    router.push(`/browse?${params}`);
  };

  const handleGenre = (g: string) => {
    const newGenre = activeGenre === g ? '' : g;
    setActiveGenre(newGenre);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (newGenre) params.set('genre', newGenre);
    router.push(`/browse?${params}`);
  };

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h1 className="section-title" style={{ fontSize: 28, marginBottom: 24 }}>Browse Anime</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            id="browse-search"
            type="text"
            className="search-input"
            placeholder="Search anime title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, maxWidth: 480, padding: '12px 16px', fontSize: 15 }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
            Search
          </button>
        </div>
      </form>

      {/* Genre filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
        {GENRES.map(g => (
          <button
            key={g}
            className={`genre-pill${activeGenre === g ? ' active' : ''}`}
            onClick={() => handleGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (q || activeGenre) && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
          {results.length} results{q ? ` for "${q}"` : ''}{activeGenre ? ` in ${activeGenre}` : ''}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '2/3' }} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="anime-row">
          {results.map(a => <AnimeCard key={a.id} anime={a} />)}
        </div>
      ) : (q || activeGenre) ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No results found</p>
          <p style={{ fontSize: 13 }}>Try a different search term or genre.</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎌</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Search for anime</p>
          <p style={{ fontSize: 13 }}>Type a title or select a genre to get started.</p>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: 40 }}>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
