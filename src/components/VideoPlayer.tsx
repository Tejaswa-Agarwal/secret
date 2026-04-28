'use client';

import { useEffect, useRef, useState } from 'react';

interface Source {
  url: string;
  quality: string;
  isM3U8: boolean;
}

interface Props {
  episodeId: string;
  animeId?: number;
  episodeNum?: number;
  title?: string;
}

type PlayerMode = 'hls' | 'embed1' | 'embed2';

const EMBED_PROVIDERS = [
  { id: 'embed1', label: '2Embed', getUrl: (animeId: number, ep: number) => `https://2embed.skin/embed/anilist/${animeId}/${ep}` },
  { id: 'embed2', label: 'VidSrc', getUrl: (animeId: number, ep: number) => `https://vidsrc.me/embed/anime?id=${animeId}&episode=${ep}` },
];

export default function VideoPlayer({ episodeId, animeId, episodeNum = 1, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<PlayerMode>('hls');
  const [hlsFailed, setHlsFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setSources([]);
    setSelectedUrl('');
    setHlsFailed(false);
    setMode('hls');

    fetch(`/api/stream/${encodeURIComponent(episodeId)}`)
      .then(r => r.json())
      .then(data => {
        const srcs: Source[] = data.sources ?? [];
        setSources(srcs);
        const best =
          srcs.find(s => s.quality === '1080p') ||
          srcs.find(s => s.quality === '720p') ||
          srcs.find(s => s.quality === 'default') ||
          srcs[0];
        if (best) {
          setSelectedUrl(best.url);
        } else {
          // No HLS sources — auto-switch to embed
          setHlsFailed(true);
          setMode('embed1');
        }
        setLoading(false);
      })
      .catch(() => {
        setHlsFailed(true);
        setMode('embed1');
        setLoading(false);
      });
  }, [episodeId]);

  useEffect(() => {
    if (mode !== 'hls' || !selectedUrl || !videoRef.current) return;
    const video = videoRef.current;
    const isHLS = selectedUrl.includes('.m3u8');
    let hlsInstance: unknown = null;

    if (isHLS && typeof window !== 'undefined') {
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
          hlsInstance = hls;
          hls.loadSource(selectedUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
          hls.on(Hls.Events.ERROR, (_: unknown, data: { fatal: boolean }) => {
            if (data.fatal) { setHlsFailed(true); setMode('embed1'); }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = selectedUrl;
          video.play().catch(() => {});
        }
      });
    } else if (selectedUrl) {
      video.src = selectedUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsInstance && typeof (hlsInstance as { destroy?: () => void }).destroy === 'function') {
        (hlsInstance as { destroy: () => void }).destroy();
      }
    };
  }, [selectedUrl, mode]);

  const embedUrl = animeId ? EMBED_PROVIDERS.find(p => p.id === mode)?.getUrl(animeId, episodeNum) : null;

  if (loading) {
    return (
      <div className="video-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
          <p style={{ fontSize: 14 }}>Loading stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Source mode switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Server:</span>
        {!hlsFailed && sources.length > 0 && (
          <button onClick={() => setMode('hls')} style={modeBtn(mode === 'hls')}>HLS Direct</button>
        )}
        {animeId && EMBED_PROVIDERS.map(p => (
          <button key={p.id} onClick={() => setMode(p.id as PlayerMode)} style={modeBtn(mode === p.id)}>{p.label}</button>
        ))}
        {hlsFailed && mode === 'hls' && (
          <span style={{ fontSize: 11, color: '#f87171' }}>⚠ Direct stream unavailable — using embed</span>
        )}
      </div>

      {/* Player */}
      {mode === 'hls' && sources.length > 0 ? (
        <div className="video-wrapper">
          <video ref={videoRef} controls autoPlay playsInline crossOrigin="anonymous" style={{ width: '100%', height: '100%', background: '#000' }} />
        </div>
      ) : embedUrl ? (
        <div className="video-wrapper">
          <iframe
            src={embedUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            allow="autoplay; fullscreen"
            title={title || 'Anime Player'}
          />
        </div>
      ) : (
        <div className="video-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 8 }}>Stream Unavailable</p>
            <p style={{ fontSize: 13 }}>Try switching servers above, or check back later.</p>
          </div>
        </div>
      )}

      {/* Quality selector (HLS mode) */}
      {mode === 'hls' && sources.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Quality:</span>
          {sources.map(s => (
            <button key={s.url} onClick={() => setSelectedUrl(s.url)} style={modeBtn(selectedUrl === s.url)}>{s.quality}</button>
          ))}
        </div>
      )}

      {title && (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 10, fontWeight: 500 }}>
          Now Playing: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{title}</span>
        </p>
      )}
    </div>
  );
}

function modeBtn(active: boolean): React.CSSProperties {
  return {
    padding: '4px 12px', borderRadius: 6, border: '1px solid',
    borderColor: active ? '#7c3aed' : 'var(--border)',
    background: active ? 'rgba(124,58,237,0.2)' : 'transparent',
    color: active ? '#a78bfa' : 'var(--text-muted)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
  };
}
