"use client";

import Link from "next/link";
import { ExternalLink, Sparkles, Zap } from "lucide-react";
import { QUANTUMY_CONFIG } from "@/lib/quantumy";
import { motion } from "framer-motion";

/**
 * Quantumy ↔ Elementary 統合ヘッダーバー
 * 両プラットフォームを行き来するグローバルナビゲーション
 */
export function UnifiedHeader() {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[60] h-8 bg-gradient-to-r from-[#7c3aed]/90 via-[#0a0a0f]/80 to-[#f59e0b]/20 backdrop-blur-md border-b border-white/5 flex items-center px-4 gap-4 text-xs"
    >
      {/* DoctorCanvas リンク */}
      <a
        href={QUANTUMY_CONFIG.baseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 hover:text-white transition-colors group"
        style={{ color: "#ffe03a" }}
      >
        <Sparkles className="w-3 h-3 group-hover:animate-pulse" />
        <span className="font-bold tracking-tight">DoctorCanvas</span>
        <ExternalLink className="w-2.5 h-2.5 opacity-50" />
      </a>

      <span className="text-white/20">×</span>

      {/* Elementary リンク */}
      <Link
        href="/"
        className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
      >
        <Zap className="w-3 h-3" />
        <span className="font-bold tracking-tight">Elementary</span>
      </Link>

      <div className="flex-1" />

      {/* DoctorCanvas CTA */}
      <a
        href={QUANTUMY_CONFIG.baseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border transition-all text-[10px] font-medium hover:opacity-90"
        style={{
          background: "rgba(255,224,58,0.15)",
          borderColor: "rgba(255,224,58,0.4)",
          color: "#ffe03a",
        }}
      >
        <Sparkles className="w-2.5 h-2.5" />
        PhD研究をマンガ化
      </a>
    </motion.div>
  );
}
