'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function UserAvatar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!session?.user) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link href="/login" className="btn-secondary" style={{ padding: '7px 16px', fontSize: 13 }}>Sign In</Link>
        <Link href="/register" className="btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>Register</Link>
      </div>
    );
  }

  const username = (session.user as { username?: string }).username || session.user.name || 'U';
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          border: 'none', cursor: 'pointer', color: '#fff',
          fontWeight: 800, fontSize: 14, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: open ? '0 0 0 2px #a855f7' : 'none',
          transition: 'box-shadow 0.2s',
        }}
      >
        {initials}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 48,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 8, minWidth: 180, zIndex: 200,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
            <p style={{ fontWeight: 700, fontSize: 14 }}>{username}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{session.user.email}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            style={{ display: 'block', padding: '9px 12px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: 8, fontSize: 13, transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            👤 My Profile
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            style={{ display: 'block', padding: '9px 12px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: 8, fontSize: 13, transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            ❤️ Watchlist
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '9px 12px', color: '#f87171', background: 'none',
              border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            🚪 Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
