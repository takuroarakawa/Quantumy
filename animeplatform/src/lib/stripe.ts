import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

export const TIP_AMOUNTS = [
  { label: "100円", amount: 100, emoji: "☕" },
  { label: "500円", amount: 500, emoji: "🍜" },
  { label: "1,000円", amount: 1000, emoji: "🎌" },
  { label: "3,000円", amount: 3000, emoji: "⚡" },
  { label: "5,000円", amount: 5000, emoji: "🔥" },
  { label: "10,000円", amount: 10000, emoji: "👑" },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: "fan",
    name: "ファン",
    amount: 500,
    description: "最新話の早期アクセス",
    features: ["最新話を24時間早期公開", "コメントに特別バッジ表示"],
  },
  {
    id: "supporter",
    name: "サポーター",
    amount: 1000,
    description: "制作を本格支援",
    features: ["全話早期アクセス", "制作裏話・スタッフロール掲載", "月1回のQ&A参加権"],
  },
  {
    id: "producer",
    name: "プロデューサー",
    amount: 3000,
    description: "作品の共同制作者として",
    features: ["全プラン特典", "エンドロールにプロデューサークレジット", "キャラ名前提案権"],
  },
];
