"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Heart, Film } from "lucide-react";
import { formatViewCount } from "@/lib/utils";
import type { Series, User } from "@prisma/client";

type SeriesWithAuthor = Series & {
  author: User;
  _count: { likes: number; episodes: number };
};

export function SeriesCard({ series }: { series: SeriesWithAuthor }) {
  const tags = JSON.parse(series.tags as string) as string[];

  return (
    <Link href={`/series/${series.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-[#1a1a26] border border-[#2a2a3e] hover:border-[#7c3aed]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7c3aed]/10">
        {/* サムネイル */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {series.coverImage ? (
            <Image
              src={series.coverImage}
              alt={series.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2a2a3e] to-[#7c3aed]/20 flex items-center justify-center">
              <Film className="w-12 h-12 text-[#6b7280]" />
            </div>
          )}

          {/* ホバーオーバーレイ */}
          <div className="absolute inset-0 bg-[#0a0a0f]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-[#0a0a0f] fill-current ml-1" />
            </div>
          </div>

          {/* バッジ */}
          <div className="absolute top-2 left-2 flex gap-1">
            {series.status === "completed" && (
              <span className="px-1.5 py-0.5 bg-green-500/90 text-white text-[10px] font-bold rounded">
                完結
              </span>
            )}
            {series.status === "ongoing" && (
              <span className="px-1.5 py-0.5 bg-[#7c3aed]/90 text-white text-[10px] font-bold rounded">
                連載中
              </span>
            )}
          </div>

          {/* 話数バッジ */}
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-0.5 bg-[#0a0a0f]/80 text-[#e8e8f0] text-[10px] rounded-full backdrop-blur-sm border border-[#2a2a3e]">
              全{series._count.episodes}話
            </span>
          </div>
        </div>

        {/* 情報 */}
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-[#a78bfa] transition-colors">
              {series.title}
            </h3>
          </div>

          <p className="text-[#6b7280] text-xs">{series.author.name}</p>

          <div className="flex items-center justify-between">
            <span className="px-1.5 py-0.5 bg-[#2a2a3e] text-[#a78bfa] text-[10px] rounded">
              {series.genre}
            </span>
            <div className="flex items-center gap-2 text-[#6b7280] text-[10px]">
              <span className="flex items-center gap-0.5">
                <Heart className="w-3 h-3" />
                {formatViewCount(series._count.likes)}
              </span>
              <span>{formatViewCount(series.viewCount)} 視聴</span>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[#6b7280] text-[10px]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
