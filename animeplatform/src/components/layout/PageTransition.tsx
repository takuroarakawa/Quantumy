"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * ページ遷移アニメーション
 *
 * ネームの論理:
 *   通常遷移  → フェードイン (0.3s)
 *   作品視聴  → 下から浮き上がり (シネマティック)
 *   Quantumy → ブラー付きスライド (AI光彩エフェクト)
 */

function getVariantKey(pathname: string) {
  if (pathname.includes("/episode/")) return "cinematic";
  if (pathname.startsWith("/quantumy")) return "quantumy";
  return "default";
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const key = getVariantKey(pathname);

  const initial =
    key === "cinematic" ? { opacity: 0, y: 30, scale: 0.98 } :
    key === "quantumy"  ? { opacity: 0, x: -40 } :
    { opacity: 0, y: 8 };

  const animate =
    key === "cinematic" ? { opacity: 1, y: 0, scale: 1 } :
    key === "quantumy"  ? { opacity: 1, x: 0 } :
    { opacity: 1, y: 0 };

  const exit =
    key === "cinematic" ? { opacity: 0, y: -20, scale: 1.01 } :
    key === "quantumy"  ? { opacity: 0, x: 40 } :
    { opacity: 0, y: -8 };

  const duration =
    key === "cinematic" ? 0.45 :
    key === "quantumy"  ? 0.5  : 0.3;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={{ duration, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
