'use client';

import { useEffect, useState } from 'react';

interface Props {
  animeId: number;
  episodeNum: number;
  title?: string;
}

// Embed providers — order matters, first one shown by default
const PROVIDERS = [
  {
    id: 'p1',
    label: '🟢 Server 1',
    // 2embed with AniList ID — most reliable
    getUrl: (id: number, ep: number) =>
      `https://2embed.skin/embed/anilist/${id}/${ep}`,
  },
  {
    id: 'p2',
    label: '🔵 Server 2',
    // VidSrc with AniList ID
    getUrl: (id: number, ep: number) =>
      `https://vidsrc.me/embed/anime?id=${id}&episode=${ep}`,
  },
  {
    id: 'p3',
    label: '🟡 Server 3',
    // embed.su — another aggregator
    getUrl: (id: number, ep: number) =>
      `https://embed.su/embed/anilist/${id}/${ep}`,
  },
];

export default function VideoPlayer({ animeId, episodeNum, title }: Props) {
  const [activeProvider, setActiveProvider] = useState(PROVIDERS[0].id);
  const [key, setKey] = useState(0); // Force iframe reload on provider switch

  // Reset to first provider whenever episode changes
  useEffect(() => {
    setActiveProvider(PROVIDERS[0].id);
    setKey(k => k + 1);
  }, [animeId, episodeNum]);

  const provider = PROVIDERS.find(p => p.id === activeProvider) ?? PROVIDERS[0];
  const embedUrl = provider.getUrl(animeId, episodeNum);

  const switchProvider = (id: string) => {
    setActiveProvider(id);
    setKey(k => k + 1);
  };

  return (
    <div>
      {/* Server switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Server:</span>
        {PROVIDERS.map(p => (
          <button
            key={p.id}
            onClick={() => switchProvider(p.id)}
            style={btnStyle(activeProvider === p.id)}
          >
            {p.label}
          </button>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
          If one doesn&apos;t load, try another →
        </span>
      </div>

      {/* Iframe player — sandbox prevents iframe from redirecting the parent page */}
      <div className="video-wrapper">
        <iframe
          key={`${key}-${animeId}-${episodeNum}`}
          src={embedUrl}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          // allow-popups lets the player open quality picker etc
          // NOT including allow-top-navigation prevents the iframe from hijacking the browser tab
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-presentation allow-fullscreen"
          referrerPolicy="no-referrer"
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
