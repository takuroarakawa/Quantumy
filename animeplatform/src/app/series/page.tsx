export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import { GENRES } from "@/lib/utils";
import Link from "next/link";

async function getSeries(genre?: string, status?: string) {
  return prisma.series.findMany({
    where: {
      isPublished: true,
      ...(genre ? { genre } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      author: true,
      _count: { select: { likes: true, episodes: true } },
    },
    orderBy: { viewCount: "desc" },
  });
}

export default async function SeriesListPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; status?: string }>;
}) {
  const { genre, status } = await searchParams;
  const seriesList = await getSeries(genre, status);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">作品一覧</h1>
            <p className="text-[#6b7280] text-sm mt-1">
              {seriesList.length}作品 {genre && `• ${genre}`}
            </p>
          </div>
        </div>

        {/* フィルター */}
        <div className="space-y-4 mb-8">
          <div>
            <p className="text-sm text-[#6b7280] mb-2">ステータス</p>
            <div className="flex gap-2">
              <Link
                href="/series"
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  !status
                    ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                    : "bg-[#12121a] border-[#2a2a3e] text-[#6b7280] hover:border-[#7c3aed]/40"
                }`}
              >
                すべて
              </Link>
              <Link
                href="/series?status=ongoing"
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  status === "ongoing"
                    ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                    : "bg-[#12121a] border-[#2a2a3e] text-[#6b7280] hover:border-[#7c3aed]/40"
                }`}
              >
                連載中
              </Link>
              <Link
                href="/series?status=completed"
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  status === "completed"
                    ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                    : "bg-[#12121a] border-[#2a2a3e] text-[#6b7280] hover:border-[#7c3aed]/40"
                }`}
              >
                完結
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm text-[#6b7280] mb-2">ジャンル</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/series"
                className={`px-3 py-1 text-sm rounded-full border transition-all ${
                  !genre
                    ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                    : "bg-[#12121a] border-[#2a2a3e] text-[#6b7280] hover:border-[#7c3aed]/40"
                }`}
              >
                すべて
              </Link>
              {GENRES.map((g) => (
                <Link
                  key={g}
                  href={`/series?genre=${encodeURIComponent(g)}`}
                  className={`px-3 py-1 text-sm rounded-full border transition-all ${
                    genre === g
                      ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                      : "bg-[#12121a] border-[#2a2a3e] text-[#6b7280] hover:border-[#7c3aed]/40"
                  }`}
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <SeriesGrid series={seriesList} />
      </div>
    </div>
  );
}
