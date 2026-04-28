import Link from 'next/link';
import type { AniListMedia } from '@/lib/anilist';

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

interface Props {
  anime: AniListMedia;
  rank?: number;
}

export default function AnimeCard({ anime, rank }: Props) {
  const title = anime.title.english || anime.title.romaji;
  const img = anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium || '';
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;

  return (
    <Link href={`/anime/${anime.id}`} className="anime-card" title={title}>
      {rank && rank <= 3 && (
        <span className="anime-card-badge">
          {rank === 1 ? '🔥 #1' : rank === 2 ? '⚡ #2' : '✨ #3'}
        </span>
      )}
      {anime.episodes && (
        <span className="anime-card-eps">{anime.episodes} eps</span>
      )}
      <img src={img} alt={title} loading="lazy" />
      <div className="anime-card-overlay">
        {score && (
          <div className="anime-card-score">
            <StarIcon /> {score}
          </div>
        )}
        <p className="anime-card-title">{title}</p>
      </div>
    </Link>
  );
}
