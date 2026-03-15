export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/series/HeroSection";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import { GenreFilter } from "@/components/series/GenreFilter";
import { CreatorSpotlight } from "@/components/series/CreatorSpotlight";
import { PlatformManifesto } from "@/components/series/PlatformManifesto";

async function getFeaturedSeries() {
  return prisma.series.findMany({
    where: { isPublished: true },
    include: {
      author: true,
      episodes: { where: { isPublished: true }, orderBy: { episodeNumber: "asc" } },
      _count: { select: { likes: true, episodes: true } },
    },
    orderBy: { viewCount: "desc" },
    take: 12,
  });
}

async function getTopCreators() {
  return prisma.user.findMany({
    where: { isCreator: true },
    include: {
      series: { where: { isPublished: true }, take: 3 },
      _count: { select: { series: true, followers: true } },
    },
    take: 4,
  });
}

export default async function HomePage() {
  const [seriesList, creators] = await Promise.all([
    getFeaturedSeries(),
    getTopCreators(),
  ]);

  const heroSeries = seriesList[0];
  const trendingSeries = seriesList.slice(0, 6);
  const newSeries = [...seriesList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6);

  return (
    <div className="min-h-screen">
      {heroSeries && <HeroSection series={heroSeries} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <PlatformManifesto />

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              <span className="text-[#a78bfa]">#</span> トレンド
            </h2>
            <a href="/series" className="text-sm text-[#6b7280] hover:text-[#a78bfa] transition-colors">
              すべて見る →
            </a>
          </div>
          <SeriesGrid series={trendingSeries} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              <span className="text-[#f59e0b]">#</span> 新着作品
            </h2>
          </div>
          <SeriesGrid series={newSeries} />
        </section>

        <GenreFilter />

        <CreatorSpotlight creators={creators} />
      </div>
    </div>
  );
}
