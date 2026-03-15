"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ExternalLink, ArrowRight, BookOpen, Film, Zap, GitBranch,
} from "lucide-react";
import { QUANTUMY_CONFIG, buildQuantumyCreateUrl } from "@/lib/quantumy";
import type { Variants } from "framer-motion";

// DoctorCanvas のカラーをそのまま取り込みつつ Elementary のアクセントと融合
const DC = QUANTUMY_CONFIG.colors; // { bg:#0f1419, primary:#253358, accent:#ffe03a, text:#e8ecf4 }

const steps: {
  icon: React.ElementType;
  from: string;
  to: string;
  label: string;
  desc: string;
  arrow: string;
}[] = [
  {
    icon: BookOpen,
    from: "DoctorCanvas",
    to: "論文・研究",
    label: "研究をマンガ化",
    desc: "PhD論文・量子情報・物理学をAIがマンガストーリーに変換。DOIリンク付きで出典保持。",
    arrow: "→",
  },
  {
    icon: GitBranch,
    from: "DoctorCanvas",
    to: "Elementary",
    label: "「Elementaryで公開」",
    desc: "DoctorCanvas の「Elementaryで公開」ボタンで、作品情報が自動入力された投稿フォームへ遷移。",
    arrow: "→",
  },
  {
    icon: Film,
    from: "Elementary",
    to: "世界 × 11言語",
    label: "配信・収益化",
    desc: "字幕・投げ銭・サブスクで研究者がダイレクトに収益化。視聴者は論文元文献にもアクセス可能。",
    arrow: "→",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0 },
};

export default function QuantumyBridgePage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(160deg, ${DC.bg} 0%, #0a0a0f 60%)` }}
    >
      {/* 背景グロー */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: DC.primary }}
        />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "#7c3aed" }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* ━━━━ ヒーロー ━━━━ */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          {/* ロゴブリッジ */}
          <div className="inline-flex items-center gap-4 mb-8">
            <a
              href={QUANTUMY_CONFIG.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all hover:scale-105"
              style={{
                background: DC.primary,
                borderColor: DC.accent + "60",
                color: DC.accent,
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-bold text-sm">DoctorCanvas</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* 接続ライン */}
            <div className="flex items-center gap-1">
              <div className="w-8 h-px" style={{ background: DC.accent + "60" }} />
              <div className="w-2 h-2 rounded-full" style={{ background: DC.accent }} />
              <div className="w-8 h-px" style={{ background: "#7c3aed60" }} />
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#7c3aed]/20 border border-[#7c3aed]/40 text-[#a78bfa] rounded-xl font-bold text-sm hover:scale-105 transition-all"
            >
              <Zap className="w-4 h-4" />
              Elementary
            </Link>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            <span style={{ color: DC.accent }}>研究を</span>
            <span style={{ color: DC.text }}>マンガに。</span>
            <br />
            <span className="text-[#a78bfa]">マンガを</span>
            <span style={{ color: DC.text }}>世界に。</span>
          </h1>

          <p className="text-[#6b7280] text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            DoctorCanvas で生成された量子力学・物理学マンガを
            Elementary が世界11言語で配信する。
            <br />
            <span style={{ color: DC.accent + "cc" }}>論文引用付きマンガ</span>という、
            新しいサイエンスコミュニケーションの形。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={QUANTUMY_CONFIG.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-2xl text-lg hover:opacity-90 transition-all hover:scale-105"
              style={{ background: DC.accent, color: DC.bg }}
            >
              <BookOpen className="w-5 h-5" />
              DoctorCanvas を開く
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>
            <Link
              href="/series"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[#1a1a26] border border-[#2a2a3e] hover:border-[#7c3aed]/50 text-white font-bold rounded-2xl transition-all text-lg"
            >
              <Film className="w-5 h-5" />
              作品を視聴する
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* ━━━━ フロー ━━━━ */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-24"
        >
          <h2
            className="text-2xl font-bold text-center mb-12"
            style={{ color: DC.text }}
          >
            研究から収益化まで、3ステップ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                  className="relative p-6 rounded-2xl border group hover:-translate-y-1 transition-all"
                  style={{
                    background: `${DC.primary}40`,
                    borderColor: DC.accent + "30",
                  }}
                >
                  {/* ステップ番号 */}
                  <div
                    className="absolute -top-3 left-5 px-2 py-0.5 rounded-full text-xs font-bold border"
                    style={{
                      background: DC.bg,
                      borderColor: DC.accent + "50",
                      color: DC.accent,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: i === 2 ? "#7c3aed" : DC.primary, border: `1.5px solid ${DC.accent}40` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: i === 2 ? "#a78bfa" : DC.accent }} />
                  </div>

                  <div
                    className="text-xs font-mono mb-1"
                    style={{ color: DC.accent + "99" }}
                  >
                    {step.from} {step.arrow} {step.to}
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: DC.text }}>
                    {step.label}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ━━━━ URLパラメータ仕様 ━━━━ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-2xl border mb-12"
          style={{ background: `${DC.primary}30`, borderColor: DC.accent + "30" }}
        >
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: DC.text }}>
            <GitBranch className="w-5 h-5" style={{ color: DC.accent }} />
            DoctorCanvas → Elementary 連携 URL 仕様
          </h3>
          <pre
            className="text-xs overflow-x-auto p-3 rounded-xl"
            style={{ background: DC.bg, color: DC.accent, border: `1px solid ${DC.accent}20` }}
          >{`https://elementary.vercel.app/creator/upload
  ?from=quantumy
  &title=量子もつれと情報理論
  &genre=SF
  &tags=量子力学,AI,PhD
  &coverImageUrl=https://...
  &sourceUrl=https://uiux-quamtumy-lr4u.vercel.app/
  &authorName=博士漫画家`}</pre>
          <p className="text-xs mt-3" style={{ color: "#6b7280" }}>
            DoctorCanvas の「Elementaryで公開」ボタンがこのURLを生成します。
            Elementary 側では作品情報が自動入力された状態で投稿フォームが開きます。
          </p>
        </motion.div>

        {/* フッター */}
        <div className="flex items-center justify-center gap-6 text-sm" style={{ color: "#6b7280" }}>
          <a
            href={QUANTUMY_CONFIG.baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            DoctorCanvas
          </a>
          <span style={{ color: DC.accent + "40" }}>×</span>
          <a
            href={QUANTUMY_CONFIG.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            UIUX_Quamtumy GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
