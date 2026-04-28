import type { AniListMedia } from '@/lib/anilist';
import AnimeCard from './AnimeCard';
import Link from 'next/link';

interface Props {
  title: string;
  anime: AniListMedia[];
  viewAllHref?: string;
  showRanks?: boolean;
}

export default function AnimeRow({ title, anime, viewAllHref, showRanks }: Props) {
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="section-title">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} style={{ color: 'var(--accent-2)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            View all →
          </Link>
        )}
      </div>
      <div className="anime-row">
        {anime.map((a, i) => (
          <AnimeCard key={a.id} anime={a} rank={showRanks ? i + 1 : undefined} />
        ))}
      </div>
    </section>
  );
}
