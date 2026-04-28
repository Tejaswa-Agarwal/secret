import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAnimeById } from '@/lib/anilist';
import { getEpisodes } from '@/lib/consumet';
import VideoPlayer from '@/components/VideoPlayer';
import EpisodeList from '@/components/EpisodeList';
import CommentSection from '@/components/CommentSection';
import ProgressTracker from '@/components/ProgressTracker';
import { SessionProvider } from 'next-auth/react';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ animeId: string; episodeId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { animeId } = await params;
  try {
    const anime = await getAnimeById(parseInt(animeId));
    const t = anime.title.english || anime.title.romaji;
    return { title: `Watching ${t} — AniStream` };
  } catch { return { title: 'Watch — AniStream' }; }
}

/** Extract episode number from our ID format: "{anilistId}-episode-{num}" */
function parseEpNum(epId: string): number {
  const match = epId.match(/-episode-(\d+)$/);
  if (match) return parseInt(match[1]);
  // Fallback: try plain number at end
  const num = parseInt(epId.split('-').pop() ?? '1');
  return isNaN(num) ? 1 : num;
}

export default async function WatchPage({ params }: Props) {
  const { animeId, episodeId } = await params;
  const numId = parseInt(animeId);
  if (isNaN(numId)) notFound();

  const decodedEpId = decodeURIComponent(episodeId);

  let anime;
  let episodes: import('@/lib/consumet').ConsumetEpisode[] = [];
  try {
    anime = await getAnimeById(numId);
  } catch { notFound(); return; }

  try {
    episodes = await getEpisodes(numId, anime.idMal);
  } catch { /* show player without episode sidebar */ }


  const title = anime.title.english || anime.title.romaji;

  // Find current episode — try by ID first, then by episode number from URL
  const currentEp = episodes.find(ep => ep.id === decodedEpId)
    ?? (() => { const n = parseEpNum(decodedEpId); return episodes.find(ep => ep.number === n); })();

  const currentIdx = currentEp ? episodes.findIndex(ep => ep.id === currentEp.id) : -1;
  const prevEp = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const nextEp = currentIdx >= 0 && currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;
  const epNum = currentEp?.number ?? parseEpNum(decodedEpId);
  const epTitle = currentEp?.title ? `Episode ${epNum} — ${currentEp.title}` : `Episode ${epNum}`;

  return (
    <SessionProvider>
      <ProgressTracker animeId={numId} episodeId={decodedEpId} episodeNum={epNum} />

      <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href={`/anime/${numId}`} style={{ color: 'var(--accent-2)', textDecoration: 'none', fontWeight: 600 }}>{title}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{epTitle}</span>
        </div>

        <div className="watch-layout">
          {/* Left: Player + navigation + comments */}
          <div>
            {/* ===== VIDEO PLAYER ===== */}
            <VideoPlayer
              animeId={numId}
              malId={anime.idMal}
              episodeNum={epNum}
              title={`${title} — ${epTitle}`}
            />

            {/* Episode navigation */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'space-between' }}>
              {prevEp ? (
                <Link href={`/watch/${numId}/${encodeURIComponent(prevEp.id)}`} className="btn-secondary" style={{ fontSize: 13, padding: '10px 20px' }}>
                  ← Ep {prevEp.number}
                </Link>
              ) : <div />}
              <Link href={`/anime/${numId}`} className="btn-secondary" style={{ fontSize: 13, padding: '10px 20px' }}>All Episodes</Link>
              {nextEp ? (
                <Link href={`/watch/${numId}/${encodeURIComponent(nextEp.id)}`} className="btn-primary" style={{ fontSize: 13, padding: '10px 20px' }}>
                  Ep {nextEp.number} →
                </Link>
              ) : <div />}
            </div>

            {/* Mini anime info */}
            <div className="glass" style={{ borderRadius: 12, padding: 20, marginTop: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
              <img
                src={anime.coverImage.large || anime.coverImage.medium || ''}
                alt={title}
                style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
              />
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>
                  {anime.episodes ? `${anime.episodes} Episodes` : ''}
                  {anime.status ? ` · ${anime.status.replace(/_/g, ' ')}` : ''}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {anime.genres?.slice(0, 3).map(g => (
                    <span key={g} className="hero-genre-tag" style={{ fontSize: 10 }}>{g}</span>
                  ))}
                </div>
                {currentEp?.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {currentEp.description}
                  </p>
                )}
              </div>
            </div>

            {/* Episode comments */}
            <CommentSection animeId={numId} episodeId={decodedEpId} />
          </div>

          {/* Right: Episode list (sticky sidebar) */}
          <div className="glass" style={{ borderRadius: 16, padding: 16, position: 'sticky', top: 80, maxHeight: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📋 Episodes</h3>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <EpisodeList animeId={numId} episodes={episodes} currentEpisodeId={currentEp?.id ?? decodedEpId} />
            </div>
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
