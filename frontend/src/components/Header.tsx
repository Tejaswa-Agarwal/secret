'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import UserAvatar from './UserAvatar';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/browse?genre=Action', label: 'Action' },
  { href: '/browse?genre=Romance', label: 'Romance' },
  { href: '/browse?status=airing', label: 'Airing' },
];

function HeaderInner() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/browse?q=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="logo">⚡ AniStream</Link>

            {/* Desktop nav */}
            <nav className="nav">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} className={`nav-link${pathname === l.href ? ' active' : ''}`}>
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <form className="search-bar" onSubmit={handleSearch}>
              <span className="search-icon"><SearchIcon /></span>
              <input
                id="header-search"
                className="search-input"
                type="text"
                placeholder="Search anime..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
              />
            </form>

            {/* Auth */}
            <UserAvatar />

            {/* Mobile hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              style={{
                display: 'none',
                background: 'none', border: 'none', color: 'var(--text-primary)',
                cursor: 'pointer', padding: 6, flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {mobileOpen
                  ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
                  : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 90,
          background: 'rgba(8,8,18,0.97)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)', padding: '16px 24px 24px',
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {NAV_LINKS.map(l => (
              <Link
                key={l.href} href={l.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: '10px 12px', borderRadius: 8, color: 'var(--text-secondary)',
                  textDecoration: 'none', fontSize: 15, fontWeight: 500,
                  background: pathname === l.href ? 'rgba(255,255,255,0.07)' : 'none',
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
            <input
              id="mobile-search"
              className="search-input"
              type="text"
              placeholder="Search anime..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: '10px 16px', fontSize: 14 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>Go</button>
          </form>
        </div>
      )}
    </>
  );
}

export default function Header() {
  return (
    <SessionProvider>
      <HeaderInner />
    </SessionProvider>
  );
}
