import Link from "next/link";
import Image from "next/image";
import { Users, Film } from "lucide-react";
import type { User, Series } from "@prisma/client";

type CreatorWithSeries = User & {
  series: Series[];
  _count: { series: number; followers: number };
};

export function CreatorSpotlight({ creators }: { creators: CreatorWithSeries[] }) {
  if (creators.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          <span className="text-[#f59e0b]">#</span> クリエイターを応援する
        </h2>
        <Link href="/creator" className="text-sm text-[#6b7280] hover:text-[#a78bfa] transition-colors">
          全員見る →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {creators.map((creator) => (
          <Link
            key={creator.id}
            href={`/creator/${creator.id}`}
            className="p-5 bg-[#12121a] border border-[#2a2a3e] rounded-xl hover:border-[#7c3aed]/40 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                {creator.name?.[0] || "C"}
              </div>
              <div>
                <p className="font-semibold text-sm">{creator.creatorName || creator.name}</p>
                <p className="text-[#6b7280] text-xs">{creator.name}</p>
              </div>
            </div>

            {creator.bio && (
              <p className="text-[#6b7280] text-xs leading-relaxed line-clamp-2 mb-4">
                {creator.bio}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-[#6b7280]">
              <span className="flex items-center gap-1">
                <Film className="w-3.5 h-3.5" />
                {creator._count.series} 作品
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {creator._count.followers} フォロワー
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
