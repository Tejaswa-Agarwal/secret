import Link from 'next/link';
import type { ConsumetEpisode } from '@/lib/consumet';

interface Props {
  animeId: number;
  episodes: ConsumetEpisode[];
  currentEpisodeId?: string;
  showThumbnails?: boolean;
}

export default function EpisodeList({ animeId, episodes, currentEpisodeId, showThumbnails }: Props) {
  if (!episodes || episodes.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>
        No episodes available yet. Check back soon!
      </div>
    );
  }

  // If thumbnails mode + few episodes: show card list
  if (showThumbnails && episodes.length <= 50) {
    return (
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>{episodes.length} Episodes</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {episodes.map(ep => {
            const isActive = currentEpisodeId === ep.id;
            return (
              <Link
                key={ep.id}
                href={`/watch/${animeId}/${encodeURIComponent(ep.id)}`}
                style={{
                  display: 'flex', gap: 10, alignItems: 'center', textDecoration: 'none',
                  borderRadius: 10, padding: 8,
                  background: isActive ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? '#7c3aed' : 'transparent'}`,
                  transition: 'all 0.2s',
                }}
                title={ep.title || `Episode ${ep.number}`}
              >
                {ep.image && (
                  <img
                    src={ep.image}
                    alt={`Ep ${ep.number}`}
                    style={{ width: 90, height: 54, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                    loading="lazy"
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Episode {ep.number}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#a78bfa' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ep.title || `Episode ${ep.number}`}
                  </p>
                </div>
                {isActive && (
                  <span style={{ fontSize: 18, flexShrink: 0 }}>▶</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: compact number grid (for long series)
  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
        {episodes.length} Episodes
      </p>
      <div className="episode-grid">
        {episodes.map(ep => (
          <Link
            key={ep.id}
            href={`/watch/${animeId}/${encodeURIComponent(ep.id)}`}
            className={`episode-btn${currentEpisodeId === ep.id ? ' active' : ''}`}
            title={ep.title || `Episode ${ep.number}`}
          >
            {ep.number}
          </Link>
        ))}
      </div>
    </div>
  );
}
