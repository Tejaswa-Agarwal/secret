import Link from 'next/link';
import type { AniListMedia } from '@/lib/anilist';

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f4c430">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

interface Props {
  anime: AniListMedia;
}

export default function Hero({ anime }: Props) {
  const title = anime.title.english || anime.title.romaji;
  const description = anime.description?.replace(/<[^>]+>/g, '') ?? '';
  const banner = anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const studio = anime.studios?.nodes?.[0]?.name;

  return (
    <section className="hero">
      {banner && (
        <img className="hero-bg" src={banner} alt={title} />
      )}
      <div className="hero-gradient" />
      <div className="hero-gradient-side" />
      <div className="container" style={{ width: '100%', paddingBottom: 0 }}>
        <div className="hero-content fade-up">
          <div className="hero-genre-tags">
            {anime.genres?.slice(0, 4).map(g => (
              <span key={g} className="hero-genre-tag">{g}</span>
            ))}
          </div>
          <h1 className="hero-title">{title}</h1>
          <p className="hero-description">{description}</p>
          <div className="hero-meta">
            {score && (
              <span className="hero-meta-item">
                <StarIcon /> {score}/10
              </span>
            )}
            {anime.episodes && (
              <span className="hero-meta-item">📺 {anime.episodes} Episodes</span>
            )}
            {anime.seasonYear && (
              <span className="hero-meta-item">📅 {anime.season} {anime.seasonYear}</span>
            )}
            {studio && (
              <span className="hero-meta-item">🎬 {studio}</span>
            )}
          </div>
          <div className="hero-actions">
            <Link href={`/anime/${anime.id}`} className="btn-primary">
              <PlayIcon /> Watch Now
            </Link>
            <Link href={`/anime/${anime.id}`} className="btn-secondary">
              <InfoIcon /> More Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
