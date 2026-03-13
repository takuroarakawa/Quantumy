export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, ChevronRight, Play, MessageCircle, Share2, Eye } from "lucide-react";
import { formatViewCount, formatDuration, formatRelativeTime } from "@/lib/utils";
import { VideoPlayerWrapper } from "@/components/player/VideoPlayerWrapper";
import { TipButton } from "@/components/monetize/TipButton";
import { SubscribeButton } from "@/components/monetize/SubscribeButton";

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
          <Link href="/" className="hover:text-[#e8e8f0] transition-colors">ホーム</Link>
          <span>/</span>
          <Link href={`/series/${series.id}`} className="hover:text-[#e8e8f0] transition-colors">
            {series.title}
          </Link>
          <span>/</span>
          <span className="text-[#e8e8f0]">第{episode.episodeNumber}話</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインプレイヤー */}
          <div className="lg:col-span-2 space-y-4">
            {/* ビデオプレイヤー */}
            {episode.videoUrl ? (
              <VideoPlayerWrapper
                videoUrl={episode.videoUrl}
                thumbnailUrl={episode.thumbnailUrl || undefined}
                subtitleUrl={episode.subtitleUrl || undefined}
                title={`${series.title} — 第${episode.episodeNumber}話 ${episode.title}`}
                episodeId={episode.id}
              />
            ) : (
              <div className="relative aspect-video bg-[#12121a] rounded-2xl overflow-hidden border border-[#2a2a3e] flex flex-col items-center justify-center gap-4">
                {episode.thumbnailUrl && (
                  <Image src={episode.thumbnailUrl} alt={episode.title} fill className="object-cover opacity-30" />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mx-auto mb-3">
                    <Play className="w-8 h-8 text-white/60 fill-current ml-1" />
                  </div>
                  <p className="text-white/60 text-sm">動画URLが設定されていません</p>
                  <p className="text-white/30 text-xs mt-1">クリエイターが動画をアップロードすると視聴できます</p>
                </div>
              </div>
            )}

            {/* エピソード情報 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <Link href={`/series/${series.id}`} className="hover:text-[#a78bfa] transition-colors">
                  {series.title}
                </Link>
                <span>•</span>
                <span>第{episode.episodeNumber}話</span>
              </div>
              <h1 className="text-2xl font-bold">{episode.title}</h1>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 text-sm text-[#6b7280]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatViewCount(episode.viewCount)} 視聴
                  </span>
                  <span>{formatRelativeTime(new Date(episode.createdAt))}</span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a26] border border-[#2a2a3e] hover:border-[#7c3aed]/50 rounded-lg text-sm transition-all">
                  <Share2 className="w-4 h-4" />
                  シェア
                </button>
              </div>

              {episode.description && (
                <p className="text-[#6b7280] text-sm leading-relaxed p-4 bg-[#12121a] rounded-xl border border-[#2a2a3e]">
                  {episode.description}
                </p>
              )}
            </div>

            {/* クリエイター情報 + 収益化 */}
            <div className="flex items-center justify-between p-4 bg-[#12121a] border border-[#2a2a3e] rounded-xl">
              <Link href={`/creator/${series.author.id}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                  {series.author.name?.[0] || "C"}
                </div>
                <div>
                  <p className="font-semibold text-sm group-hover:text-[#a78bfa] transition-colors">
                    {series.author.creatorName || series.author.name}
                  </p>
                  <p className="text-[#6b7280] text-xs">クリエイター</p>
                </div>
              </Link>
              <div className="flex gap-2">
                <TipButton
                  creatorId={series.author.id}
                  creatorName={series.author.name || "クリエイター"}
                />
                <SubscribeButton
                  creatorId={series.author.id}
                  creatorName={series.author.name || "クリエイター"}
                />
              </div>
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
                      第{prevEpisode.episodeNumber}話 {prevEpisode.title}
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
                      第{nextEpisode.episodeNumber}話 {nextEpisode.title}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6b7280] group-hover:text-[#a78bfa] transition-colors" />
                </Link>
              ) : <div className="flex-1" />}
            </div>

            {/* コメント */}
            <div className="p-6 bg-[#12121a] border border-[#2a2a3e] rounded-xl">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#a78bfa]" />
                コメント ({episode._count.comments})
              </h3>
              <div className="text-center py-6 text-[#6b7280]">
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

          {/* サイドバー */}
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
                    <div className="flex items-center gap-2 text-[10px] text-[#6b7280]">
                      {ep.duration && <span>{formatDuration(ep.duration)}</span>}
                      {ep.isFree ? (
                        <span className="text-green-400">無料</span>
                      ) : (
                        <span className="text-[#a78bfa]">premium</span>
                      )}
                    </div>
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
