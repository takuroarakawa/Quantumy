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
  // UIUX_Quamtumy = DoctorCanvas の実稼働URL
  baseUrl: process.env.NEXT_PUBLIC_QUANTUMY_URL ?? "https://uiux-quamtumy-lr4u.vercel.app",
  // リポジトリ (UIUX_Quamtumy → Quantumy にリネーム後)
  githubUrl: "https://github.com/takuroarakawa/Quantumy",
  description: "DoctorCanvas — PhD研究のマンガ化プラットフォーム",
  // DoctorCanvas のデザイントークン（Elementary との共鳴に使用）
  colors: {
    bg: "#0f1419",
    primary: "#253358",
    accent: "#ffe03a",
    text: "#e8ecf4",
    blue: "#3f51b5",
  },
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
  // DoctorCanvas はシングルページなのでクエリパラメータでコンテキストを渡す
  const params = new URLSearchParams({ from: "elementary" });
  if (seriesId) params.set("elementarySeriesId", seriesId);
  return `${QUANTUMY_CONFIG.baseUrl}/?${params}`;
}
