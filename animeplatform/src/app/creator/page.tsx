export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Film, PlusCircle } from "lucide-react";

async function getCreators() {
  return prisma.user.findMany({
    where: { isCreator: true },
    include: {
      series: {
        where: { isPublished: true },
        orderBy: { viewCount: "desc" },
        take: 3,
        include: { _count: { select: { likes: true, episodes: true } } },
      },
      _count: { select: { series: true, followers: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function CreatorListPage() {
  const creators = await getCreators();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">クリエイター</h1>
            <p className="text-[#6b7280] text-sm mt-1">
              12話の縛りを超えて、自由に表現するアニメクリエイターたち
            </p>
          </div>
          <Link
            href="/creator/upload"
            className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm rounded-xl font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            作品を投稿する
          </Link>
        </div>

        {creators.length === 0 ? (
          <div className="text-center py-20 text-[#6b7280]">
            <p>まだクリエイターが登録されていません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                href={`/creator/${creator.id}`}
                className="p-6 bg-[#12121a] border border-[#2a2a3e] rounded-2xl hover:border-[#7c3aed]/40 transition-all group"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {creator.name?.[0] || "C"}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-[#a78bfa] transition-colors">
                      {creator.creatorName || creator.name}
                    </h3>
                    <p className="text-[#6b7280] text-sm">{creator.name}</p>
                    <div className="flex gap-3 mt-1 text-xs text-[#6b7280]">
                      <span className="flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        {creator._count.series} 作品
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {creator._count.followers} フォロワー
                      </span>
                    </div>
                  </div>
                </div>

                {creator.bio && (
                  <p className="text-[#6b7280] text-sm leading-relaxed line-clamp-2 mb-4">
                    {creator.bio}
                  </p>
                )}

                {creator.series.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-[#6b7280] mb-2">代表作品</p>
                    {creator.series.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                        <span className="truncate">{s.title}</span>
                        <span className="text-xs text-[#6b7280] ml-auto">
                          {s._count.episodes}話
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
