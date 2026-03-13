export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import { Search } from "lucide-react";

async function searchSeries(query: string) {
  if (!query) return [];
  return prisma.series.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { genre: { contains: query } },
        { tags: { contains: query } },
      ],
    },
    include: {
      author: true,
      _count: { select: { likes: true, episodes: true } },
    },
    orderBy: { viewCount: "desc" },
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await searchSeries(q);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {q ? (
              <>
                「<span className="text-[#a78bfa]">{q}</span>」の検索結果
              </>
            ) : (
              "検索"
            )}
          </h1>
          {q && (
            <p className="text-[#6b7280] text-sm">{results.length}件の作品が見つかりました</p>
          )}
        </div>

        {q ? (
          results.length > 0 ? (
            <SeriesGrid series={results} />
          ) : (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-[#2a2a3e] mx-auto mb-4" />
              <p className="text-[#6b7280]">「{q}」に一致する作品が見つかりませんでした</p>
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-[#2a2a3e] mx-auto mb-4" />
            <p className="text-[#6b7280]">検索ワードを入力してください</p>
          </div>
        )}
      </div>
    </div>
  );
}
