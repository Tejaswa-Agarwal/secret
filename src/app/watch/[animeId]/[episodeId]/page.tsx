import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAnimeById } from '@/lib/anilist';
import { getEpisodes } from '@/lib/consumet';
import VideoPlayer from '@/components/VideoPlayer';
import EpisodeList from '@/components/EpisodeList';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ animeId: string; episodeId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { animeId, episodeId } = await params;
  try {
    const anime = await getAnimeById(parseInt(animeId));
    const title = anime.title.english || anime.title.romaji;
    const epNum = decodeURIComponent(episodeId);
    return { title: `${title} — AniStream` };
  } catch {
    return { title: 'Watch — AniStream' };
  }
}

export default async function WatchPage({ params }: Props) {
  const { animeId, episodeId } = await params;
  const numId = parseInt(animeId);
  if (isNaN(numId)) notFound();

  const decodedEpId = decodeURIComponent(episodeId);

  let anime;
  let episodes;

  try {
    [anime, episodes] = await Promise.all([
      getAnimeById(numId),
      getEpisodes(numId),
    ]);
  } catch {
    notFound();
  }

  const title = anime.title.english || anime.title.romaji;
  const currentEp = episodes.find(ep => ep.id === decodedEpId);
  const currentIdx = episodes.findIndex(ep => ep.id === decodedEpId);
  const prevEp = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const nextEp = currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;
  const epTitle = currentEp ? `Episode ${currentEp.number}${currentEp.title ? ` — ${currentEp.title}` : ''}` : `Episode`;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link href={`/anime/${numId}`} style={{ color: 'var(--accent-2)', textDecoration: 'none', fontWeight: 600 }}>{title}</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{epTitle}</span>
      </div>

      <div className="watch-layout">
        {/* Left: Player + navigation */}
        <div>
          <VideoPlayer episodeId={decodedEpId} title={`${title} — ${epTitle}`} />

          {/* Episode navigation */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'space-between' }}>
            {prevEp ? (
              <Link
                href={`/watch/${numId}/${encodeURIComponent(prevEp.id)}`}
                className="btn-secondary"
                style={{ fontSize: 13, padding: '10px 20px' }}
              >
                ← Ep {prevEp.number}
              </Link>
            ) : <div />}
            <Link href={`/anime/${numId}`} className="btn-secondary" style={{ fontSize: 13, padding: '10px 20px' }}>
              All Episodes
            </Link>
            {nextEp ? (
              <Link
                href={`/watch/${numId}/${encodeURIComponent(nextEp.id)}`}
                className="btn-primary"
                style={{ fontSize: 13, padding: '10px 20px' }}
              >
                Ep {nextEp.number} →
              </Link>
            ) : <div />}
          </div>

          {/* Anime info mini card */}
          <div className="glass" style={{ borderRadius: 12, padding: 20, marginTop: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
            <img
              src={anime.coverImage.large || anime.coverImage.medium || ''}
              alt={title}
              style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
            />
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>
                {anime.episodes ? `${anime.episodes} Episodes` : ''}{anime.status ? ` · ${anime.status.replace(/_/g, ' ')}` : ''}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {anime.genres?.slice(0, 3).map(g => (
                  <span key={g} className="hero-genre-tag" style={{ fontSize: 10 }}>{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Episode list */}
        <div className="glass" style={{ borderRadius: 16, padding: 20, position: 'sticky', top: 80, maxHeight: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📋 Episodes</h3>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <EpisodeList animeId={numId} episodes={episodes} currentEpisodeId={decodedEpId} />
          </div>
        </div>
      </div>
    </div>
  );
}
