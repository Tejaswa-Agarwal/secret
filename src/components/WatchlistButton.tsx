'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface Props {
  animeId: number;
}

export default function WatchlistButton({ animeId }: Props) {
  const { data: session } = useSession();
  const [inList, setInList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/watchlist?animeId=${animeId}`)
      .then(r => r.json())
      .then(d => { setInList(d.inWatchlist); setChecked(true); });
  }, [animeId, session]);

  if (!session?.user) return null;

  const toggle = async () => {
    setLoading(true);
    const method = inList ? 'DELETE' : 'POST';
    await fetch('/api/watchlist', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animeId }),
    });
    setInList(l => !l);
    setLoading(false);
  };

  return (
    <button
      id={`watchlist-btn-${animeId}`}
      onClick={toggle}
      disabled={loading || !checked}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '11px 22px',
        background: inList ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${inList ? '#ec4899' : 'var(--border)'}`,
        borderRadius: 12, color: inList ? '#f472b6' : 'var(--text-secondary)',
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>{inList ? '❤️' : '🤍'}</span>
      {inList ? 'In Watchlist' : 'Add to Watchlist'}
    </button>
  );
}
