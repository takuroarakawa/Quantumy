"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, X, Check, Loader2 } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe";

interface SubscribeButtonProps {
  creatorId: string;
  creatorName: string;
}

export function SubscribeButton({ creatorId, creatorName }: SubscribeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("fan");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan, creatorId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl transition-all hover:scale-105"
      >
        <Star className="w-4 h-4 fill-current" />
        サポートする
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-[#2a2a3e] rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">
                <span className="text-gradient">{creatorName}</span> のサポートプラン
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-[#6b7280] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#6b7280] mb-5">
              月額サポートでクリエイターの活動を継続的に支援。特別特典を受け取れます。
            </p>

            <div className="space-y-3 mb-5">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedPlan === plan.id
                      ? "bg-[#7c3aed]/10 border-[#7c3aed]"
                      : "bg-[#0a0a0f] border-[#2a2a3e] hover:border-[#7c3aed]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{plan.name}</span>
                    <span className="font-bold text-[#a78bfa]">
                      ¥{plan.amount.toLocaleString()}<span className="text-xs text-[#6b7280] font-normal">/月</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#6b7280] mb-2">{plan.description}</p>
                  <div className="space-y-1">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-1.5 text-xs">
                        <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-[#6b7280]">{f}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Star className="w-4 h-4 fill-current" />
                  Stripeで支払いへ →
                </>
              )}
            </button>
            <p className="text-xs text-center text-[#6b7280] mt-3">
              いつでもキャンセル可能 • Stripeで安全に決済
            </p>
          </div>
        </div>
      )}
    </>
  );
}
