export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SeriesGrid } from "@/components/series/SeriesGrid";
import { Users, Film, Calendar } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { TipButton } from "@/components/monetize/TipButton";
import { SubscribeButton } from "@/components/monetize/SubscribeButton";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe";
import { Check } from "lucide-react";

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
      _count: { select: { series: true, followers: true, subscribers: true } },
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
          <div className="relative -mt-16 flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-6">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] flex items-center justify-center text-white font-bold text-4xl border-4 border-[#0a0a0f] flex-shrink-0">
              {creator.name?.[0] || "C"}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold">
                {creator.creatorName || creator.name}
              </h1>
              <p className="text-[#6b7280] text-sm">{creator.name}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#6b7280]">
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
            <div className="flex gap-2 pb-2">
              <TipButton creatorId={creator.id} creatorName={creator.name || "クリエイター"} />
              <SubscribeButton creatorId={creator.id} creatorName={creator.name || "クリエイター"} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {creator.bio && (
          <div className="p-5 bg-[#12121a] border border-[#2a2a3e] rounded-xl">
            <p className="text-[#6b7280] leading-relaxed">{creator.bio}</p>
          </div>
        )}

        {/* サポートプラン */}
        <section>
          <h2 className="text-xl font-bold mb-4">サポートプラン</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SUBSCRIPTION_PLANS.map((plan, i) => (
              <div
                key={plan.id}
                className={`p-5 rounded-xl border transition-all ${
                  i === 1
                    ? "bg-[#7c3aed]/10 border-[#7c3aed]"
                    : "bg-[#12121a] border-[#2a2a3e]"
                }`}
              >
                {i === 1 && (
                  <span className="inline-block px-2 py-0.5 bg-[#7c3aed] text-white text-xs font-bold rounded mb-3">
                    人気
                  </span>
                )}
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-2xl font-bold text-[#a78bfa] mb-1">
                  ¥{plan.amount.toLocaleString()}
                  <span className="text-sm text-[#6b7280] font-normal">/月</span>
                </p>
                <p className="text-[#6b7280] text-sm mb-4">{plan.description}</p>
                <div className="space-y-2 mb-4">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[#6b7280]">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">公開作品</h2>
          <SeriesGrid series={creator.series} />
        </section>
      </div>
    </div>
  );
}
