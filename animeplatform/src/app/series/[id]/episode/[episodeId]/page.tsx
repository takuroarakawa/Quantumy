import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, ChevronRight, Play, MessageCircle, Heart, Share2, Eye } from "lucide-react";
import { formatViewCount, formatDuration, formatRelativeTime } from "@/lib/utils";

async function getEpisode(episodeId: string) {
  return prisma.episode.findUnique({
    where: { id: episodeId, isPublished: true },
    include: {
      series: {
        include: {
          author: true,
          episodes: {
            where: { isPublished: true },
            orderBy: { episodeNumber: "asc" },
          },
        },
      },
      author: true,
      _count: { select: { comments: true } },
    },
  });
}

export default async function EpisodePlayerPage({
  params,
}: {
  params: Promise<{ id: string; episodeId: string }>;
}) {
  const { id, episodeId } = await params;
  const episode = await getEpisode(episodeId);

  if (!episode || episode.seriesId !== id) notFound();

  const { series } = episode;
  const episodes = series.episodes;
  const currentIndex = episodes.findIndex((e) => e.id === episodeId);
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ブレッドクラム */}
        <nav className="flex items-center gap-2 text-sm text-[#6b7280] mb-4">
          <Link href="/" className="hover:text-[#e8e8f0]">ホーム</Link>
          <span>/</span>
          <Link href={`/series/${series.id}`} className="hover:text-[#e8e8f0]">{series.title}</Link>
          <span>/</span>
          <span className="text-[#e8e8f0]">第{episode.episodeNumber}話</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインプレイヤー */}
          <div className="lg:col-span-2 space-y-4">
            {/* ビデオプレイヤー */}
            <div className="relative aspect-video bg-[#12121a] rounded-2xl overflow-hidden border border-[#2a2a3e]">
              {episode.thumbnailUrl && (
                <Image
                  src={episode.thumbnailUrl}
                  alt={episode.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-[#0a0a0f]/60 flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer group">
                  <Play className="w-8 h-8 text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-white/70 text-sm">
                  ※ デモ環境 — 実際の動画URLを設定すると再生されます
                </p>
              </div>

              {/* コントロールバー */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0f] to-transparent p-4">
                <div className="w-full h-1 bg-[#2a2a3e] rounded-full mb-3">
                  <div className="h-full w-0 bg-[#7c3aed] rounded-full" />
                </div>
                <div className="flex items-center justify-between text-white text-sm">
                  <div className="flex items-center gap-3">
                    <span>0:00</span>
                    <span className="text-white/50">/</span>
                    <span>{episode.duration ? formatDuration(episode.duration) : "--:--"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* エピソード情報 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <span>{series.title}</span>
                <span>•</span>
                <span>第{episode.episodeNumber}話</span>
              </div>
              <h1 className="text-2xl font-bold">{episode.title}</h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-[#6b7280]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatViewCount(episode.viewCount)} 視聴
                  </span>
                  <span>{formatRelativeTime(new Date(episode.createdAt))}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a26] border border-[#2a2a3e] hover:border-[#7c3aed]/50 rounded-lg text-sm transition-all">
                    <Heart className="w-4 h-4" />
                    いいね
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a26] border border-[#2a2a3e] hover:border-[#7c3aed]/50 rounded-lg text-sm transition-all">
                    <Share2 className="w-4 h-4" />
                    シェア
                  </button>
                </div>
              </div>

              {episode.description && (
                <p className="text-[#6b7280] text-sm leading-relaxed p-4 bg-[#12121a] rounded-xl border border-[#2a2a3e]">
                  {episode.description}
                </p>
              )}
            </div>

            {/* 前後ナビゲーション */}
            <div className="flex gap-3">
              {prevEpisode ? (
                <Link
                  href={`/series/${series.id}/episode/${prevEpisode.id}`}
                  className="flex-1 flex items-center gap-2 p-4 bg-[#12121a] border border-[#2a2a3e] hover:border-[#7c3aed]/40 rounded-xl transition-all group"
                >
                  <ChevronLeft className="w-5 h-5 text-[#6b7280] group-hover:text-[#a78bfa] transition-colors" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#6b7280]">前話</p>
                    <p className="text-sm font-medium truncate group-hover:text-[#a78bfa] transition-colors">
                      第{prevEpisode.episodeNumber}話
                    </p>
                  </div>
                </Link>
              ) : <div className="flex-1" />}

              {nextEpisode ? (
                <Link
                  href={`/series/${series.id}/episode/${nextEpisode.id}`}
                  className="flex-1 flex items-center justify-end gap-2 p-4 bg-[#12121a] border border-[#2a2a3e] hover:border-[#7c3aed]/40 rounded-xl transition-all group"
                >
                  <div className="min-w-0 text-right">
                    <p className="text-xs text-[#6b7280]">次話</p>
                    <p className="text-sm font-medium truncate group-hover:text-[#a78bfa] transition-colors">
                      第{nextEpisode.episodeNumber}話
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6b7280] group-hover:text-[#a78bfa] transition-colors" />
                </Link>
              ) : <div className="flex-1" />}
            </div>

            {/* コメント欄 */}
            <div className="p-6 bg-[#12121a] border border-[#2a2a3e] rounded-xl">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#a78bfa]" />
                コメント ({episode._count.comments})
              </h3>
              <div className="text-center py-8 text-[#6b7280]">
                <p className="text-sm">ログインしてコメントする</p>
                <Link
                  href="/auth/signin"
                  className="mt-3 inline-block px-4 py-2 bg-[#7c3aed] text-white text-sm rounded-lg hover:bg-[#6d28d9] transition-colors"
                >
                  ログイン
                </Link>
              </div>
            </div>
          </div>

          {/* サイドバー：エピソード一覧 */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">
              {series.title}
              <span className="text-[#6b7280] text-sm font-normal ml-2">全{episodes.length}話</span>
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {episodes.map((ep) => (
                <Link
                  key={ep.id}
                  href={`/series/${series.id}/episode/${ep.id}`}
                  className={`flex gap-3 p-3 rounded-xl border transition-all ${
                    ep.id === episodeId
                      ? "bg-[#2a2a3e] border-[#7c3aed]/50"
                      : "bg-[#12121a] border-[#2a2a3e] hover:border-[#7c3aed]/40 hover:bg-[#1a1a26]"
                  }`}
                >
                  <div className="relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[#0a0a0f]">
                    {ep.thumbnailUrl ? (
                      <Image src={ep.thumbnailUrl} alt={ep.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-[#6b7280]" />
                      </div>
                    )}
                    {ep.id === episodeId && (
                      <div className="absolute inset-0 bg-[#7c3aed]/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#6b7280]">第{ep.episodeNumber}話</p>
                    <p className={`text-sm font-medium truncate ${ep.id === episodeId ? "text-[#a78bfa]" : ""}`}>
                      {ep.title}
                    </p>
                    {ep.duration && (
                      <p className="text-xs text-[#6b7280]">{formatDuration(ep.duration)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
