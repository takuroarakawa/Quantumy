/**
 * Quantumy ↔ Elementary ブリッジ設定
 *
 * Quantumy:  「AIでマンガを生成するPhD研究プラットフォーム」
 * Elementary: 「生成されたマンガを世界に配信するプラットフォーム」
 *
 * データフロー:
 *   Quantumy (AI生成) ──→ publish API ──→ Elementary (配信・収益化)
 *   Elementary (視聴者) ──→ "AIで作る" ──→ Quantumy (創作開始)
 */

export const QUANTUMY_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_QUANTUMY_URL ?? "https://quantumy.vercel.app",
  apiUrl: process.env.NEXT_PUBLIC_QUANTUMY_API_URL ?? "https://api.quantumy.vercel.app",
  githubUrl: "https://github.com/takuroarakawa/Quantumy",
  description: "PhD research's outcome has drawing manga by AI.",
} as const;

export const ELEMENTARY_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_ELEMENTARY_URL ?? "https://elementary.vercel.app",
  name: "Elementary",
  tagline: "12話の縛りを超えて",
} as const;

// Quantumy → Elementary への遷移に使うクエリパラメータ
export type QuantumyPublishPayload = {
  title: string;
  titleEn?: string;
  description: string;
  genre: string;
  tags: string[];
  coverImageUrl?: string;
  sourceUrl: string;       // Quantumy上の元URL
  authorId: string;
  authorName: string;
};

export function buildPublishUrl(payload: QuantumyPublishPayload): string {
  const params = new URLSearchParams({
    from: "quantumy",
    title: payload.title,
    description: payload.description,
    genre: payload.genre,
    tags: payload.tags.join(","),
    sourceUrl: payload.sourceUrl,
    authorId: payload.authorId,
    authorName: payload.authorName,
    ...(payload.titleEn ? { titleEn: payload.titleEn } : {}),
    ...(payload.coverImageUrl ? { coverImageUrl: payload.coverImageUrl } : {}),
  });
  return `${ELEMENTARY_CONFIG.baseUrl}/creator/upload?${params}`;
}

export function buildQuantumyCreateUrl(seriesId?: string): string {
  if (seriesId) {
    return `${QUANTUMY_CONFIG.baseUrl}/create?elementarySeriesId=${seriesId}`;
  }
  return `${QUANTUMY_CONFIG.baseUrl}/create?from=elementary`;
}
