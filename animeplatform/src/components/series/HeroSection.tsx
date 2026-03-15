"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star, Clock, Film } from "lucide-react";
import type { Series, User, Episode } from "@prisma/client";

type SeriesWithRelations = Series & {
  author: User;
  episodes: Episode[];
  _count: { likes: number; episodes: number };
};

export function HeroSection({ series }: { series: SeriesWithRelations }) {
  const tags = JSON.parse(series.tags as string) as string[];

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[700px]">
      {/* 背景画像 */}
      <div className="absolute inset-0">
        {series.bannerImage ? (
          <Image
            src={series.bannerImage}
            alt={series.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a26] to-[#7c3aed]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/20" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 flex flex-col justify-end h-full pb-16 px-8 max-w-7xl mx-auto">
        <div className="max-w-2xl space-y-4 animate-[fadeIn_0.6s_ease-out]">
          {/* バッジ */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#7c3aed] text-white text-xs font-bold rounded uppercase tracking-wider">
              注目作品
            </span>
            <span className="px-2 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] text-xs rounded border border-[#f59e0b]/30">
              {series.genre}
            </span>
            {series.status === "completed" && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                完結
              </span>
            )}
          </div>

          {/* タイトル */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">{series.title}</h1>
          {series.titleEn && (
            <p className="text-sm text-[#6b7280] italic">{series.titleEn}</p>
          )}

          {/* メタ情報 */}
          <div className="flex items-center gap-4 text-sm text-[#6b7280]">
            <span className="flex items-center gap-1">
              <Film className="w-4 h-4" />
              全{series._count.episodes}話
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#f59e0b]" />
              {series._count.likes} いいね
            </span>
            <span className="text-[#a78bfa]">by {series.author.name}</span>
          </div>

          {/* 説明 */}
          <p className="text-[#6b7280] text-sm leading-relaxed line-clamp-3 max-w-xl">
            {series.description}
          </p>

          {/* タグ */}
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[#1a1a26] border border-[#2a2a3e] text-[#6b7280] text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* CTAボタン */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/series/${series.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#0a0a0f] hover:bg-[#e8e8f0] font-bold rounded-xl transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              第1話を観る
            </Link>
            <Link
              href={`/series/${series.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-[#1a1a26]/80 hover:bg-[#2a2a3e] border border-[#2a2a3e] font-medium rounded-xl backdrop-blur-sm transition-all"
            >
              <Info className="w-5 h-5" />
              詳細を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
