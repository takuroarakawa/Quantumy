import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Play, Heart, Eye, Film, Clock, ChevronRight, User } from "lucide-react";
import { formatViewCount, formatDuration, formatRelativeTime } from "@/lib/utils";

async function getSeries(id: string) {
  return prisma.series.findUnique({
    where: { id, isPublished: true },
    include: {
      author: true,
      episodes: {
        where: { isPublished: true },
        orderBy: { episodeNumber: "asc" },
      },
      _count: { select: { likes: true } },
    },
  });
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const series = await getSeries(id);

  if (!series) notFound();

  const tags = JSON.parse(series.tags as string) as string[];
  const firstEpisode = series.episodes[0];

  return (
    <div className="min-h-screen">
      {/* バナー */}
      <div className="relative w-full h-64 md:h-96">
        {series.bannerImage ? (
          <Image src={series.bannerImage} alt={series.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a26] to-[#7c3aed]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* カバー画像 */}
          <div className="flex-shrink-0">
            <div className="relative w-48 h-72 md:w-56 md:h-80 rounded-xl overflow-hidden border-2 border-[#2a2a3e] shadow-2xl">
              {series.coverImage ? (
                <Image src={series.coverImage} alt={series.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#2a2a3e] to-[#7c3aed]/20 flex items-center justify-center">
                  <Film className="w-16 h-16 text-[#6b7280]" />
                </div>
              )}
            </div>
          </div>

          {/* 情報 */}
          <div className="flex-1 pt-8 md:pt-16 space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 bg-[#7c3aed]/20 text-[#a78bfa] text-xs rounded border border-[#7c3aed]/30">
                {series.genre}
              </span>
              <span
                className={`px-2 py-0.5 text-xs rounded border ${
                  series.status === "completed"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                }`}
              >
                {series.status === "completed" ? "完結" : "連載中"}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">{series.title}</h1>
            {series.titleEn && (
              <p className="text-[#6b7280] italic text-sm">{series.titleEn}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-[#6b7280]">
              <Link
                href={`/creator/${series.author.id}`}
                className="flex items-center gap-1.5 hover:text-[#a78bfa] transition-colors"
              >
                <User className="w-4 h-4" />
                {series.author.creatorName || series.author.name}
              </Link>
              <span className="flex items-center gap-1">
                <Film className="w-4 h-4" />
                全{series.episodes.length}話
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatViewCount(series.viewCount)} 視聴
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {series._count.likes} いいね
              </span>
            </div>

            <p className="text-[#6b7280] leading-relaxed max-w-2xl">{series.description}</p>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#1a1a26] border border-[#2a2a3e] text-[#6b7280] text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* CTAボタン */}
            <div className="flex gap-3 pt-2">
              {firstEpisode && (
                <Link
                  href={`/series/${series.id}/episode/${firstEpisode.id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-[#0a0a0f] hover:bg-[#e8e8f0] font-bold rounded-xl transition-all hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-current" />
                  第1話を観る
                </Link>
              )}
              <button className="flex items-center gap-2 px-4 py-3 bg-[#1a1a26] border border-[#2a2a3e] hover:border-[#7c3aed]/50 rounded-xl transition-all">
                <Heart className="w-5 h-5" />
                いいね
              </button>
            </div>
          </div>
        </div>

        {/* エピソード一覧 */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            エピソード一覧
            <span className="text-[#6b7280] text-base font-normal ml-2">
              ({series.episodes.length}話)
            </span>
          </h2>

          <div className="space-y-2">
            {series.episodes.map((episode) => (
              <Link
                key={episode.id}
                href={`/series/${series.id}/episode/${episode.id}`}
                className="flex items-center gap-4 p-4 bg-[#12121a] border border-[#2a2a3e] rounded-xl hover:border-[#7c3aed]/40 hover:bg-[#1a1a26] transition-all group"
              >
                {/* サムネイル */}
                <div className="relative w-32 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-[#0a0a0f]">
                  {episode.thumbnailUrl ? (
                    <Image
                      src={episode.thumbnailUrl}
                      alt={episode.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-[#6b7280]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#0a0a0f]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>

                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#6b7280]">第{episode.episodeNumber}話</span>
                    {episode.isFree ? (
                      <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded">
                        無料
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-[#7c3aed]/20 text-[#a78bfa] text-[10px] rounded">
                        プレミアム
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium truncate group-hover:text-[#a78bfa] transition-colors">
                    {episode.title}
                  </h3>
                  {episode.description && (
                    <p className="text-[#6b7280] text-xs line-clamp-1 mt-0.5">
                      {episode.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[#6b7280] text-xs mt-1">
                    {episode.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(episode.duration)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViewCount(episode.viewCount)} 視聴
                    </span>
                    <span>{formatRelativeTime(new Date(episode.createdAt))}</span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-[#6b7280] group-hover:text-[#a78bfa] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
