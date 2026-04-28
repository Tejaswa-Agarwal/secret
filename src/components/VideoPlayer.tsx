'use client';

import { useEffect, useState } from 'react';

interface Props {
  animeId: number;      // AniList ID
  malId?: number;       // MyAnimeList ID (more widely supported by embeds)
  episodeNum: number;
  title?: string;
}

/**
 * Embed providers — ordered by reliability for anime.
 * We use MAL ID where possible since it's the universal standard
 * recognized by all anime databases. AniList IDs are only used by
 * providers that explicitly support them.
 */
const getProviders = (animeId: number, malId: number | undefined, ep: number) => [
  {
    id: 'p1',
    label: '🟢 Server 1',
    // vidsrc.me uses MAL ID for anime — correct content guaranteed
    url: malId
      ? `https://vidsrc.me/embed/anime?mal=${malId}&episode=${ep}`
      : `https://vidsrc.me/embed/anime?id=${animeId}&episode=${ep}`,
  },
  {
    id: 'p2',
    label: '🔵 Server 2',
    // vidsrc.net supports MAL ID
    url: malId
      ? `https://vidsrc.net/embed/anime?mal=${malId}&ep=${ep}`
      : null,
  },
  {
    id: 'p3',
    label: '🟡 Server 3',
    // embed.su supports AniList IDs for anime specifically
    url: `https://embed.su/embed/anilist/${animeId}/${ep}`,
  },
  {
    id: 'p4',
    label: '🟠 Server 4',
    // 2embed with MAL ID — correct mapping
    url: malId
      ? `https://2embed.skin/embed/anime/mal/${malId}/${ep}`
      : null,
  },
].filter(p => p.url !== null) as { id: string; label: string; url: string }[];

export default function VideoPlayer({ animeId, malId, episodeNum, title }: Props) {
  const [activeId, setActiveId] = useState('p1');
  const [key, setKey] = useState(0);

  // Reset to first provider when episode changes
  useEffect(() => {
    setActiveId('p1');
    setKey(k => k + 1);
  }, [animeId, episodeNum]);

  const providers = getProviders(animeId, malId, episodeNum);
  const active = providers.find(p => p.id === activeId) ?? providers[0];

  const switchProvider = (id: string) => {
    setActiveId(id);
    setKey(k => k + 1);
  };

  return (
    <div>
      {/* Server switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Server:</span>
        {providers.map(p => (
          <button
            key={p.id}
            onClick={() => switchProvider(p.id)}
            style={btnStyle(activeId === p.id)}
          >
            {p.label}
          </button>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
          If one fails, try another server →
        </span>
      </div>

      {/* Player — NO sandbox attr since embed providers block sandboxed iframes */}
      <div className="video-wrapper">
        <iframe
          key={`${key}-${animeId}-${episodeNum}-${activeId}`}
          src={active.url}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
          title={title ?? `Episode ${episodeNum}`}
          loading="eager"
        />
      </div>

      {title && (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 10, fontWeight: 500 }}>
          Now Playing: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{title}</span>
        </p>
      )}
    </div>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '5px 14px', borderRadius: 7, border: '1px solid',
    borderColor: active ? '#7c3aed' : 'var(--border)',
    background: active ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
    color: active ? '#c4b5fd' : 'var(--text-muted)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.18s',
  };
}
