import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAnimeById, type AniListMedia } from '@/lib/anilist';
import { getEpisodes, type ConsumetEpisode } from '@/lib/consumet';
import EpisodeList from '@/components/EpisodeList';
import AnimeCard from '@/components/AnimeCard';
import CommentSection from '@/components/CommentSection';
import WatchlistButton from '@/components/WatchlistButton';
import { SessionProvider } from 'next-auth/react';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const anime = await getAnimeById(parseInt(id));
    const title = anime.title.english || anime.title.romaji;
    return {
      title: `${title} — AniStream`,
      description: anime.description?.replace(/<[^>]+>/g, '').slice(0, 160),
    };
  } catch { return { title: 'Anime — AniStream' }; }
}

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f4c430"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
);

export default async function AnimePage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id);
  if (isNaN(numId)) notFound();

  let anime: AniListMedia;
  let episodes: ConsumetEpisode[] = [];
  try {
    [anime, episodes] = await Promise.all([getAnimeById(numId), getEpisodes(numId)]);
  } catch { notFound(); }

  const title = anime.title.english || anime.title.romaji;
  const banner = anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large;
  const description = anime.description?.replace(/<[^>]+>/g, '') ?? '';
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const studio = anime.studios?.nodes?.[0]?.name;
  const firstEp = episodes[0];
  const recommendations = anime.recommendations?.nodes?.map(n => n.mediaRecommendation).filter(Boolean).slice(0, 8) ?? [];

  return (
    <SessionProvider>
      <div>
        {/* Banner */}
        {banner && (
          <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
            <img src={banner} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,8,18,0.2), rgba(8,8,18,1))' }} />
          </div>
        )}

        <div className="container" style={{ paddingTop: banner ? 0 : 40, paddingBottom: 60 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, marginTop: -120, position: 'relative', zIndex: 1, alignItems: 'start' }}>
            {/* Poster */}
            <div>
              <img
                src={anime.coverImage.extraLarge || anime.coverImage.large || ''}
                alt={title}
                style={{ width: '100%', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.7)', border: '2px solid rgba(255,255,255,0.08)' }}
              />
              {firstEp && (
                <Link href={`/watch/${numId}/${encodeURIComponent(firstEp.id)}`} className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 16, boxSizing: 'border-box' }}>
                  ▶ Watch Episode 1
                </Link>
              )}
              <div style={{ marginTop: 12 }}>
                <WatchlistButton animeId={numId} />
              </div>
            </div>

            {/* Info */}
            <div style={{ paddingTop: 120 }}>
              <h1 style={{ fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 900, marginBottom: 6 }}>{title}</h1>
              {anime.title.native && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>{anime.title.native}</p>}

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
                {score && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 15 }}><StarIcon /> {score}/10</span>}
                {anime.episodes && <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📺 {anime.episodes} Episodes</span>}
                {anime.status && <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>⚡ {anime.status.replace(/_/g, ' ')}</span>}
                {anime.season && anime.seasonYear && <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📅 {anime.season} {anime.seasonYear}</span>}
                {studio && <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>🎬 {studio}</span>}
                {anime.format && <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>🎞 {anime.format.replace(/_/g, ' ')}</span>}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {anime.genres?.map(g => (
                  <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`} className="genre-pill active" style={{ fontSize: 12 }}>{g}</Link>
                ))}
              </div>

              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14, maxWidth: 640, marginBottom: 32 }}>{description}</p>

              <div>
                <h2 className="section-title" style={{ fontSize: 18, marginBottom: 16 }}>Episodes</h2>
              <EpisodeList animeId={numId} episodes={episodes} showThumbnails={episodes.length <= 50} />
              </div>
            </div>
          </div>

          {/* Characters */}
          {anime.characters?.nodes && anime.characters.nodes.length > 0 && (
            <div style={{ marginTop: 60 }}>
              <h2 className="section-title" style={{ fontSize: 20, marginBottom: 20 }}>Characters</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 16 }}>
                {anime.characters.nodes.slice(0, 8).map((char, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <img src={char.image?.large || char.image?.medium || ''} alt={char.name.full}
                      style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.3 }}>{char.name.full}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div style={{ marginTop: 60 }}>
              <h2 className="section-title" style={{ fontSize: 20, marginBottom: 20 }}>You Might Also Like</h2>
              <div className="anime-row">
                {recommendations.map(rec => rec && <AnimeCard key={rec.id} anime={rec} />)}
              </div>
            </div>
          )}

          {/* Comments */}
          <CommentSection animeId={numId} />
        </div>
      </div>
    </SessionProvider>
  );
}
