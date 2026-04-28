'use client';

import { useEffect, useState, useRef } from 'react';

interface Props {
  animeId: number;
  malId?: number;
  episodeNum: number;
  title?: string;
}

/**
 * Multi-source player. All embeds are tested in the USER'S browser
 * (not server-side) so network blocks on the server don't affect playback.
 *
 * Sources use MAL ID (idMal) — the universal anime database key.
 * AniList ID used as last-resort fallback only.
 */
const getSources = (animeId: number, malId: number | undefined, ep: number) => {
  const sources = [];

  if (malId) {
    sources.push(
      { id: 's1', label: 'Server 1', url: `https://vidsrc.me/embed/anime?mal=${malId}&episode=${ep}` },
      { id: 's2', label: 'Server 2', url: `https://vidsrc.pro/embed/anime/${malId}/${ep}` },
      { id: 's3', label: 'Server 3', url: `https://multiembed.mov/anime?video_id=${malId}&tmdb=1&s=1&e=${ep}` },
      { id: 's4', label: 'Server 4', url: `https://vidsrc.cc/v2/embed/anime/${malId}/${ep}` },
    );
  }

  // AniList-based sources (always available)
  sources.push(
    { id: 's5', label: 'Server 5', url: `https://embed.su/embed/anilist/${animeId}/${ep}` },
    { id: 's6', label: 'Server 6', url: `https://2anime.xyz/embed/${animeId}/${ep}` },
  );

  return sources;
};

export default function VideoPlayer({ animeId, malId, episodeNum, title }: Props) {
  const [activeId, setActiveId] = useState('s1');
  const [iframeKey, setIframeKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sources = getSources(animeId, malId, episodeNum);

  useEffect(() => {
    // Reset to first source on episode change
    setActiveId(sources[0]?.id ?? 's1');
    setIframeKey(k => k + 1);
    setLoaded(false);
    setFailed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId, episodeNum]);

  const switchTo = (id: string) => {
    setActiveId(id);
    setIframeKey(k => k + 1);
    setLoaded(false);
    setFailed(false);
  };

  const activeSource = sources.find(s => s.id === activeId) ?? sources[0];
  const currentIndex = sources.findIndex(s => s.id === activeId);

  const tryNext = () => {
    const next = sources[currentIndex + 1];
    if (next) switchTo(next.id);
  };

  return (
    <div>
      {/* Server bar */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 10,
        flexWrap: 'wrap', alignItems: 'center',
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 10, border: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginRight: 4 }}>SERVERS:</span>
        {sources.map(s => (
          <button key={s.id} onClick={() => switchTo(s.id)} style={btnStyle(s.id === activeId)}>
            {s.label}
          </button>
        ))}
        {currentIndex < sources.length - 1 && (
          <button
            onClick={tryNext}
            title="Try next server if current one doesn't work"
            style={{ marginLeft: 'auto', fontSize: 11, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            ⟳ Try Next
          </button>
        )}
      </div>

      {/* Player wrapper */}
      <div className="video-wrapper" style={{ position: 'relative' }}>
        {/* Loading shimmer */}
        {!loaded && !failed && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#000', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '3px solid rgba(124,58,237,0.25)',
              borderTopColor: '#7c3aed',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading {activeSource.label}…</p>
          </div>
        )}

        {failed && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#0a0a16', gap: 12, padding: 24,
          }}>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>{activeSource.label} unavailable</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
              This server couldn&apos;t load the episode. Try another server.
            </p>
            {currentIndex < sources.length - 1 && (
              <button onClick={tryNext} className="btn-primary" style={{ marginTop: 8 }}>
                Try {sources[currentIndex + 1]?.label} →
              </button>
            )}
          </div>
        )}

        <iframe
          key={`${iframeKey}-${animeId}-${episodeNum}-${activeId}`}
          ref={iframeRef}
          src={activeSource.url}
          style={{
            width: '100%', height: '100%', border: 'none', display: 'block',
            opacity: loaded ? 1 : 0, transition: 'opacity 0.3s',
          }}
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
          title={title ?? `Episode ${episodeNum}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(false); setFailed(true); }}
        />
      </div>

      {/* Episode title */}
      {title && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 10 }}>
          ▶ <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{title}</span>
        </p>
      )}

      {/* Tip */}
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
        💡 If a server shows wrong content or a black screen, hit <strong style={{ color: 'var(--text-secondary)' }}>Try Next</strong> or pick another server above.
      </p>
    </div>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '4px 12px', borderRadius: 6, border: '1px solid',
    borderColor: active ? '#7c3aed' : 'rgba(255,255,255,0.1)',
    background: active ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.04)',
    color: active ? '#c4b5fd' : 'var(--text-muted)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.15s',
  };
}
