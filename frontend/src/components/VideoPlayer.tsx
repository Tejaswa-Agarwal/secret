'use client';

import { useEffect, useState, useRef } from 'react';

interface Props {
  animeId: number;
  malId?: number;
  episodeNum: number;
  title?: string;
}

const getSources = (animeId: number, malId: number | undefined, ep: number) => {
  const s = [];

  // MAL ID based — most accurate anime mapping
  if (malId) {
    s.push({ id: 's1', label: 'Server 1', url: `https://vidsrc.me/embed/anime?mal=${malId}&episode=${ep}`, type: 'embed' });
    s.push({ id: 's2', label: 'Server 2', url: `https://vidsrc.pro/embed/anime/${malId}/${ep}`, type: 'embed' });
  }

  // AniList ID based
  s.push({ id: 's3', label: 'Server 3', url: `https://embed.su/embed/anilist/${animeId}/${ep}`, type: 'embed' });

  // Always-last fallback
  if (malId) {
    s.push({ id: 's4', label: 'Server 4', url: `https://vidsrc.to/embed/anime/${malId}/${ep}`, type: 'embed' });
  }

  return s;
};

export default function VideoPlayer({ animeId, malId, episodeNum, title }: Props) {
  const [activeId, setActiveId] = useState('s1');
  const [iframeKey, setIframeKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sources = getSources(animeId, malId, episodeNum);

  useEffect(() => {
    const first = getSources(animeId, malId, episodeNum)[0];
    setActiveId(first?.id ?? 's1');
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
  const currentIdx = sources.findIndex(s => s.id === activeId);

  return (
    <div>
      {/* Server bar */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center',
        padding: '8px 12px', background: 'rgba(255,255,255,0.03)',
        borderRadius: 10, border: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginRight: 4 }}>SERVERS:</span>
        {sources.map(s => (
          <button key={s.id} onClick={() => switchTo(s.id)} style={btnStyle(s.id === activeId)}>
            {s.label}
          </button>
        ))}
        {!loaded && !failed && (
          <span style={{ fontSize: 11, color: '#f4c430', marginLeft: 'auto' }}>⏳ Loading…</span>
        )}
        {loaded && (
          <span style={{ fontSize: 11, color: '#4ade80', marginLeft: 'auto' }}>✓ Playing</span>
        )}
      </div>

      {/* Player */}
      <div className="video-wrapper" style={{ position: 'relative', background: '#000' }}>
        {/* Spinner */}
        {!loaded && !failed && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading {activeSource.label}…</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, opacity: 0.6 }}>
              This may take a few seconds
            </p>
          </div>
        )}

        {/* Failed overlay */}
        {failed && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#0a0a16', padding: 24,
          }}>
            <div style={{ fontSize: 36 }}>⚠️</div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>{activeSource.label} didn&apos;t load</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', maxWidth: 300 }}>
              Try switching to a different server. Each one uses a different streaming source.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              {sources.filter(s => s.id !== activeId).map(s => (
                <button key={s.id} onClick={() => switchTo(s.id)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                  Try {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <iframe
          key={`${iframeKey}-${animeId}-${episodeNum}-${activeId}`}
          ref={iframeRef}
          src={activeSource.url}
          style={{
            width: '100%', height: '100%', border: 'none', display: 'block',
            opacity: loaded ? 1 : 0, transition: 'opacity 0.4s',
          }}
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
          title={title ?? `Episode ${episodeNum}`}
          onLoad={() => { setLoaded(true); setFailed(false); }}
          onError={() => { setLoaded(false); setFailed(true); }}
        />
      </div>

      {title && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
          ▶ <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{title}</span>
        </p>
      )}

      <div style={{
        marginTop: 8, padding: '8px 12px', borderRadius: 8,
        background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
        fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
      }}>
        💡 <strong style={{ color: 'var(--text-secondary)' }}>Tip:</strong> If a server shows a wrong page or doesn&apos;t play, click another server above. Servers 1 &amp; 2 use MAL ID (most accurate). For best results, deploy the <strong style={{ color: 'var(--text-secondary)' }}>backend</strong> from the <code style={{ color: '#a78bfa' }}>/backend</code> folder to get direct HLS streams.
      </div>
    </div>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '4px 12px', borderRadius: 6, border: '1px solid',
    borderColor: active ? '#7c3aed' : 'rgba(255,255,255,0.1)',
    background: active ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.04)',
    color: active ? '#c4b5fd' : 'var(--text-muted)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
  };
}
