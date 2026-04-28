import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAnimeById } from '@/lib/anilist';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [user, watchlist, history] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.watchlist.findMany({ where: { userId: session.user.id }, orderBy: { addedAt: 'desc' }, take: 20 }),
    prisma.progress.findMany({ where: { userId: session.user.id }, orderBy: { watchedAt: 'desc' }, take: 20 }),
  ]);

  if (!user) redirect('/login');

  // Fetch anime info for watchlist and history
  const watchlistAnime = await Promise.allSettled(watchlist.map(w => getAnimeById(w.animeId)));
  const historyAnime = await Promise.allSettled([...new Map(history.map(h => [h.animeId, h])).values()].map(h => getAnimeById(h.animeId)));

  const initials = user.username.slice(0, 2).toUpperCase();
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      {/* Profile header */}
      <div className="glass" style={{ borderRadius: 20, padding: 32, marginBottom: 40, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 900, color: '#fff', flexShrink: 0,
          boxShadow: '0 0 30px rgba(124,58,237,0.4)',
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{user.username}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user.email} · Joined {joinDate}</p>
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{watchlist.length}</strong> Watchlist
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{history.length}</strong> Episodes Watched
            </span>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="btn-secondary" style={{ fontSize: 13 }}>Sign Out</button>
        </form>
      </div>

      {/* Watchlist */}
      <section style={{ marginBottom: 48 }}>
        <h2 className="section-title" style={{ fontSize: 20, marginBottom: 20 }}>❤️ My Watchlist</h2>
        {watchlistAnime.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nothing saved yet. Browse anime and click the heart button!</p>
        ) : (
          <div className="anime-row">
            {watchlistAnime.map((result, i) => {
              if (result.status !== 'fulfilled') return null;
              const anime = result.value;
              return (
                <Link key={watchlist[i].animeId} href={`/anime/${anime.id}`} className="anime-card">
                  <img src={anime.coverImage.extraLarge || anime.coverImage.large || ''} alt={anime.title.english || anime.title.romaji} loading="lazy" />
                  <div className="anime-card-overlay">
                    <p className="anime-card-title">{anime.title.english || anime.title.romaji}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Watch History */}
      <section>
        <h2 className="section-title" style={{ fontSize: 20, marginBottom: 20 }}>🕐 Watch History</h2>
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>You haven&apos;t watched anything yet. Start watching!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.slice(0, 10).map((h, i) => {
              const animeResult = historyAnime.find((r, idx) => {
                const uniqueIds = [...new Map(history.map(h2 => [h2.animeId, h2])).keys()];
                return uniqueIds[idx] === h.animeId;
              });
              const anime = animeResult?.status === 'fulfilled' ? animeResult.value : null;
              return (
                <Link
                  key={h.id}
                  href={`/watch/${h.animeId}/${encodeURIComponent(h.episodeId)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="glass" style={{ borderRadius: 12, padding: 16, display: 'flex', gap: 16, alignItems: 'center', transition: 'background 0.2s' }}>
                    {anime && (
                      <img
                        src={anime.coverImage.large || anime.coverImage.medium || ''}
                        alt=""
                        style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                        {anime ? (anime.title.english || anime.title.romaji) : `Anime #${h.animeId}`}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        Episode {h.episodeNum} · {new Date(h.watchedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ color: 'var(--accent-2)', fontSize: 13, fontWeight: 600 }}>▶ Continue</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
