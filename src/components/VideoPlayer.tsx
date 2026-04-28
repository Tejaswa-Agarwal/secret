'use client';

import { useEffect, useRef, useState } from 'react';

interface Source {
  url: string;
  quality: string;
  isM3U8: boolean;
}

interface Props {
  episodeId: string;
  title?: string;
}

export default function VideoPlayer({ episodeId, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setSources([]);
    setSelectedUrl('');
    fetch(`/api/stream/${encodeURIComponent(episodeId)}`)
      .then(r => r.json())
      .then(data => {
        const srcs: Source[] = data.sources ?? [];
        setSources(srcs);
        // Pick best source: prefer 1080p > 720p > default > first
        const best =
          srcs.find(s => s.quality === '1080p') ||
          srcs.find(s => s.quality === '720p') ||
          srcs.find(s => s.quality === 'default') ||
          srcs[0];
        if (best) setSelectedUrl(best.url);
        else setError('No streaming sources found for this episode.');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load streaming sources. The episode may not be available.');
        setLoading(false);
      });
  }, [episodeId]);

  useEffect(() => {
    if (!selectedUrl || !videoRef.current) return;
    const video = videoRef.current;
    const isHLS = selectedUrl.includes('.m3u8');

    if (isHLS && typeof window !== 'undefined') {
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          });
          hls.loadSource(selectedUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          return () => hls.destroy();
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = selectedUrl;
          video.play().catch(() => {});
        }
      });
    } else {
      video.src = selectedUrl;
      video.play().catch(() => {});
    }
  }, [selectedUrl]);

  if (loading) {
    return (
      <div className="video-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: 48, height: 48, border: '3px solid rgba(124,58,237,0.3)',
            borderTopColor: '#7c3aed', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
          <p style={{ fontSize: 14 }}>Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 8 }}>Stream Unavailable</p>
          <p style={{ fontSize: 13 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="video-wrapper">
        <video
          ref={videoRef}
          controls
          autoPlay
          playsInline
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', background: '#000' }}
        />
      </div>
      {/* Quality selector */}
      {sources.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Quality:</span>
          {sources.map(s => (
            <button
              key={s.url}
              onClick={() => setSelectedUrl(s.url)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: '1px solid',
                borderColor: selectedUrl === s.url ? '#7c3aed' : 'var(--border)',
                background: selectedUrl === s.url ? 'rgba(124,58,237,0.2)' : 'transparent',
                color: selectedUrl === s.url ? '#a78bfa' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {s.quality}
            </button>
          ))}
        </div>
      )}
      {title && (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 12, fontWeight: 500 }}>
          Now Playing: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{title}</span>
        </p>
      )}
    </div>
  );
}
