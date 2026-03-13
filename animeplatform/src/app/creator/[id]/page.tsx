import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import { Users, Film, Calendar } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

async function getCreator(id: string) {
  return prisma.user.findUnique({
    where: { id, isCreator: true },
    include: {
      series: {
        where: { isPublished: true },
        include: {
          author: true,
          _count: { select: { likes: true, episodes: true } },
        },
        orderBy: { viewCount: "desc" },
      },
      _count: { select: { series: true, followers: true } },
    },
  });
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creator = await getCreator(id);

  if (!creator) notFound();

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-[#7c3aed]/30 via-[#1a1a26] to-[#f59e0b]/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 flex items-end gap-6 pb-6">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] flex items-center justify-center text-white font-bold text-4xl border-4 border-[#0a0a0f] flex-shrink-0">
              {creator.name?.[0] || "C"}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold">
                {creator.creatorName || creator.name}
              </h1>
              <p className="text-[#6b7280] text-sm">{creator.name}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-[#6b7280]">
                <span className="flex items-center gap-1">
                  <Film className="w-4 h-4" />
                  {creator._count.series} 作品
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {creator._count.followers} フォロワー
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatRelativeTime(new Date(creator.createdAt))}から活動
                </span>
              </div>
            </div>
            <div className="ml-auto pb-2">
              <button className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl font-medium transition-colors">
                フォロー
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {creator.bio && (
          <div className="p-5 bg-[#12121a] border border-[#2a2a3e] rounded-xl">
            <p className="text-[#6b7280] leading-relaxed">{creator.bio}</p>
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold mb-4">公開作品</h2>
          <SeriesGrid series={creator.series} />
        </section>
      </div>
    </div>
  );
}
