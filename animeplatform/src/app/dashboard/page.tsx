import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TrendingUp, Film, Heart, Users, Eye, PlusCircle, Banknote, MessageCircle } from "lucide-react";
import { formatViewCount, formatRelativeTime } from "@/lib/utils";

async function getDashboardData(userId: string) {
  const [series, tips, subscriptions] = await Promise.all([
    prisma.series.findMany({
      where: { authorId: userId },
      include: {
        episodes: true,
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tip.findMany({
      where: { creatorId: userId },
      include: { tipper: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.subscription.findMany({
      where: { creatorId: userId, status: "active" },
      include: { subscriber: true },
    }),
  ]);

  const totalViews = series.reduce((sum, s) => sum + s.viewCount, 0);
  const totalLikes = series.reduce((sum, s) => sum + s._count.likes, 0);
  const totalTipAmount = tips.reduce((sum, t) => sum + t.amount, 0);
  const monthlySubscriptionRevenue = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  return { series, tips, subscriptions, totalViews, totalLikes, totalTipAmount, monthlySubscriptionRevenue };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const data = await getDashboardData(session.user.id);

  const stats = [
    { label: "総視聴数", value: formatViewCount(data.totalViews), icon: Eye, color: "text-blue-400" },
    { label: "いいね", value: formatViewCount(data.totalLikes), icon: Heart, color: "text-red-400" },
    { label: "サポーター", value: `${data.subscriptions.length}人`, icon: Users, color: "text-purple-400" },
    { label: "月額収益", value: `¥${data.monthlySubscriptionRevenue.toLocaleString()}`, icon: Banknote, color: "text-yellow-400" },
    { label: "投げ銭累計", value: `¥${data.totalTipAmount.toLocaleString()}`, icon: TrendingUp, color: "text-green-400" },
    { label: "公開作品数", value: `${data.series.filter((s) => s.isPublished).length}本`, icon: Film, color: "text-[#a78bfa]" },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">クリエイターダッシュボード</h1>
            <p className="text-[#6b7280] text-sm mt-1">{session.user.name} さんの活動状況</p>
          </div>
          <Link
            href="/creator/upload"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            新しい作品を投稿
          </Link>
        </div>

        {/* KPIカード */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-4 bg-[#12121a] border border-[#2a2a3e] rounded-xl">
                <Icon className={`w-5 h-5 ${stat.color} mb-3`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-[#6b7280] text-xs mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 作品一覧 */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">公開中の作品</h2>
            {data.series.length === 0 ? (
              <div className="p-8 bg-[#12121a] border border-[#2a2a3e] rounded-xl text-center">
                <Film className="w-12 h-12 text-[#2a2a3e] mx-auto mb-3" />
                <p className="text-[#6b7280] text-sm">まだ作品がありません</p>
                <Link href="/creator/upload" className="mt-3 inline-block text-sm text-[#a78bfa] hover:underline">
                  最初の作品を投稿する →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.series.map((series) => (
                  <div
                    key={series.id}
                    className="flex items-center gap-4 p-4 bg-[#12121a] border border-[#2a2a3e] rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{series.title}</h3>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] rounded flex-shrink-0 ${
                            series.isPublished
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {series.isPublished ? "公開中" : "下書き"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#6b7280]">
                        <span className="flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          {series.episodes.length}話
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatViewCount(series.viewCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {series._count.likes}
                        </span>
                        <span>{formatRelativeTime(new Date(series.createdAt))}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        href={`/series/${series.id}`}
                        className="px-3 py-1.5 bg-[#2a2a3e] hover:bg-[#3a3a4e] text-sm rounded-lg transition-colors"
                      >
                        確認
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* サイドバー：収益・サポーター */}
          <div className="space-y-6">
            {/* サポーター */}
            <div>
              <h2 className="text-xl font-bold mb-4">
                アクティブサポーター
                <span className="text-[#6b7280] text-sm font-normal ml-2">
                  {data.subscriptions.length}人
                </span>
              </h2>
              {data.subscriptions.length === 0 ? (
                <div className="p-5 bg-[#12121a] border border-[#2a2a3e] rounded-xl text-center text-sm text-[#6b7280]">
                  まだサポーターがいません
                </div>
              ) : (
                <div className="space-y-2">
                  {data.subscriptions.slice(0, 5).map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 p-3 bg-[#12121a] border border-[#2a2a3e] rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] flex items-center justify-center text-white text-xs font-bold">
                        {sub.subscriber.name?.[0] || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sub.subscriber.name}</p>
                        <p className="text-xs text-[#6b7280]">
                          {sub.plan}プラン · ¥{sub.amount.toLocaleString()}/月
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 最新投げ銭 */}
            <div>
              <h2 className="text-xl font-bold mb-4">最新の投げ銭</h2>
              {data.tips.length === 0 ? (
                <div className="p-5 bg-[#12121a] border border-[#2a2a3e] rounded-xl text-center text-sm text-[#6b7280]">
                  まだ投げ銭がありません
                </div>
              ) : (
                <div className="space-y-2">
                  {data.tips.slice(0, 5).map((tip) => (
                    <div key={tip.id} className="p-3 bg-[#12121a] border border-[#2a2a3e] rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{tip.tipper.name}</span>
                        <span className="text-sm font-bold text-[#f59e0b]">
                          ¥{tip.amount.toLocaleString()}
                        </span>
                      </div>
                      {tip.message && (
                        <p className="text-xs text-[#6b7280] flex items-start gap-1">
                          <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {tip.message}
                        </p>
                      )}
                      <p className="text-[10px] text-[#6b7280] mt-1">
                        {formatRelativeTime(new Date(tip.createdAt))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
