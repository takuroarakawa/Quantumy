"use client";

import { Zap, Infinity, Users, Globe } from "lucide-react";

const features = [
  {
    icon: Infinity,
    title: "話数の自由",
    description: "1話でも50話でも。あなたの物語が必要とする長さで作る。12話の呪縛から解放。",
    color: "from-[#7c3aed] to-[#a78bfa]",
  },
  {
    icon: Zap,
    title: "即時配信",
    description: "完成した瞬間に公開。放送スケジュールに縛られない、リアルタイムの物語。",
    color: "from-[#f59e0b] to-[#fbbf24]",
  },
  {
    icon: Users,
    title: "直接つながる",
    description: "視聴者とクリエイターが直接対話。コメント・いいねが次の話を動かす原動力。",
    color: "from-[#10b981] to-[#34d399]",
  },
  {
    icon: Globe,
    title: "日本発、世界へ",
    description: "字幕機能で海外視聴者にも届ける。日本のアニメ文化を世界標準で発信。",
    color: "from-[#3b82f6] to-[#60a5fa]",
  },
];

export function PlatformManifesto() {
  return (
    <section className="py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">
          <span className="text-gradient">アニメ表現の</span>再定義
        </h2>
        <p className="text-[#6b7280] max-w-xl mx-auto text-sm leading-relaxed">
          キー局の12話縛り、放送スケジュール、プロデューサーの圧力。
          <br />
          それらすべてから自由になったとき、本当に作りたいアニメが生まれる。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="p-5 bg-[#12121a] border border-[#2a2a3e] rounded-xl hover:border-[#7c3aed]/40 transition-all group"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
