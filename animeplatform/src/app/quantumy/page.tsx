"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, Zap, ArrowRight, ExternalLink,
  GitBranch, Film, Brain, Rocket,
} from "lucide-react";
import { QUANTUMY_CONFIG, buildQuantumyCreateUrl } from "@/lib/quantumy";
import type { Variants } from "framer-motion";

const flowSteps = [
  {
    icon: Brain,
    platform: "Quantumy",
    color: "from-[#7c3aed] to-[#a78bfa]",
    title: "研究をマンガ化",
    desc: "AIがPhD研究・論文・専門知識をマンガストーリーに変換。KaTeX数式もそのまま埋め込む。",
  },
  {
    icon: GitBranch,
    platform: "Bridge API",
    color: "from-[#f59e0b] to-[#fbbf24]",
    title: "Elementary に公開",
    desc: "ワンクリックで Elementary のクリエイターページに転送。話数制限なし・即時公開。",
  },
  {
    icon: Film,
    platform: "Elementary",
    color: "from-[#10b981] to-[#34d399]",
    title: "世界中で視聴・収益化",
    desc: "Stripe による投げ銭・サブスクで研究者が直接収益化。11言語字幕で世界展開。",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function QuantumyBridgePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* 背景グラデーション */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-60 -left-60 w-[500px] h-[500px] bg-[#7c3aed]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-60 -right-60 w-[500px] h-[500px] bg-[#f59e0b]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* ヒーロー */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed]/20 border border-[#7c3aed]/40 rounded-full">
              <Sparkles className="w-4 h-4 text-[#a78bfa]" />
              <span className="text-[#a78bfa] font-bold text-sm">Quantumy</span>
            </div>
            <span className="text-[#6b7280] text-2xl font-light">×</span>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a26] border border-[#2a2a3e] rounded-full">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-sm">Elementary</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            <span className="text-gradient">研究をマンガに。</span>
            <br />
            <span className="text-white">マンガを世界に。</span>
          </h1>

          <p className="text-[#6b7280] text-lg max-w-2xl mx-auto leading-relaxed">
            Quantumyが生み出したAIマンガを、Elementaryが世界中の視聴者へ届ける。
            <br />
            PhD研究の成果物が、11言語で読まれる作品になる。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <a
              href={buildQuantumyCreateUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white font-bold rounded-2xl hover:opacity-90 transition-all hover:scale-105 text-lg"
            >
              <Sparkles className="w-5 h-5" />
              Quantumyでマンガを生成する
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>
            <Link
              href="/series"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[#12121a] border border-[#2a2a3e] hover:border-[#7c3aed]/50 text-white font-bold rounded-2xl transition-all text-lg"
            >
              <Film className="w-5 h-5" />
              作品を視聴する
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* フロー図 */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-24"
        >
          <h2 className="text-2xl font-bold text-center mb-12 text-[#e8e8f0]">
            研究から収益化まで、3ステップ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* 接続線 */}
            <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[#7c3aed]/50 via-[#f59e0b]/50 to-[#10b981]/50" />

            {flowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={item}
                  className="relative p-6 bg-[#12121a] border border-[#2a2a3e] rounded-2xl hover:border-[#7c3aed]/40 transition-all group"
                >
                  <div className="absolute -top-3 left-6">
                    <span className="px-2 py-0.5 bg-[#0a0a0f] border border-[#2a2a3e] text-[#6b7280] text-xs rounded-full">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="text-xs text-[#6b7280] mb-1 font-mono">{step.platform}</div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quantumy からの公開フロー説明 */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-8 bg-gradient-to-br from-[#7c3aed]/10 to-[#f59e0b]/5 border border-[#7c3aed]/30 rounded-2xl mb-12"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#7c3aed] flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Quantumy クリエイターの方へ</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
                Quantumyで生成したマンガは、Elementary の <code className="px-1 py-0.5 bg-[#1a1a26] rounded text-[#a78bfa] text-xs">/creator/upload</code> から
                直接公開できます。URLパラメータで作品情報が自動入力されます。
              </p>
              <div className="font-mono text-xs bg-[#0a0a0f] p-3 rounded-xl border border-[#2a2a3e] text-[#a78bfa] overflow-x-auto">
                {`/creator/upload?from=quantumy&title=...&genre=SF&tags=AI,physics`}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <a
            href={QUANTUMY_CONFIG.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#a78bfa] transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Quantumy の GitHub を見る
          </a>
        </motion.div>
      </div>
    </div>
  );
}
