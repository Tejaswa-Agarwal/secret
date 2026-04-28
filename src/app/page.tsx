import { getTrendingAnime, getPopularAnime } from '@/lib/anilist';
import Hero from '@/components/Hero';
import AnimeRow from '@/components/AnimeRow';

export const revalidate = 3600; // ISR: revalidate every hour

export default async function HomePage() {
  const [trending, popular] = await Promise.all([
    getTrendingAnime(1, 16),
    getPopularAnime(1, 16),
  ]);

  const hero = trending[0];

  return (
    <>
      {hero && <Hero anime={hero} />}
      <div className="container" style={{ paddingTop: 48 }}>
        <AnimeRow
          title="🔥 Trending Now"
          anime={trending.slice(1)}
          viewAllHref="/browse?sort=trending"
          showRanks
        />
        <AnimeRow
          title="⭐ All-Time Popular"
          anime={popular}
          viewAllHref="/browse?sort=popular"
        />
      </div>
    </>
  );
}
