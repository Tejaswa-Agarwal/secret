'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/browse?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          <Link href="/" className="logo">⚡ AniStream</Link>
          <nav className="nav">
            <Link href="/" className={`nav-link${pathname === '/' ? ' active' : ''}`}>Home</Link>
            <Link href="/browse" className={`nav-link${pathname.startsWith('/browse') ? ' active' : ''}`}>Browse</Link>
            <Link href="/browse?genre=Action" className="nav-link">Action</Link>
            <Link href="/browse?genre=Romance" className="nav-link">Romance</Link>
            <Link href="/browse?genre=Fantasy" className="nav-link">Fantasy</Link>
          </nav>
          <form className="search-bar" onSubmit={handleSearch}>
            <span className="search-icon"><SearchIcon /></span>
            <input
              id="search-input"
              className="search-input"
              type="text"
              placeholder="Search anime..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
