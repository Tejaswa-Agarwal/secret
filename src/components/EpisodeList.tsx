import Link from 'next/link';
import type { ConsumetEpisode } from '@/lib/consumet';

interface Props {
  animeId: number;
  episodes: ConsumetEpisode[];
  currentEpisodeId?: string;
}

export default function EpisodeList({ animeId, episodes, currentEpisodeId }: Props) {
  if (!episodes || episodes.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>
        No episodes available yet. Check back soon!
      </div>
    );
  }

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
