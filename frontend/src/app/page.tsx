import { getTrendingAnime, getPopularAnime, getCurrentlyAiring, getTopRated } from '@/lib/anilist';
import Hero from '@/components/Hero';
import AnimeRow from '@/components/AnimeRow';

export const revalidate = 3600;

export default async function HomePage() {
  const [trending, popular, airing, topRated] = await Promise.all([
    getTrendingAnime(1, 16),
    getPopularAnime(1, 16),
    getCurrentlyAiring(1, 16),
    getTopRated(1, 16),
  ]);

  const hero = trending[0];

  return (
    <>
      {hero && <Hero anime={hero} />}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        <AnimeRow
          title="🔥 Trending Now"
          anime={trending.slice(1)}
          viewAllHref="/browse?sort=trending"
          showRanks
        />
        <AnimeRow
          title="📡 Currently Airing"
          anime={airing}
          viewAllHref="/browse?status=airing"
        />
        <AnimeRow
          title="⭐ All-Time Popular"
          anime={popular}
          viewAllHref="/browse?sort=popular"
        />
        <AnimeRow
          title="🏆 Top Rated"
          anime={topRated}
          viewAllHref="/browse?sort=score"
        />
      </div>
    </>
  );
}
