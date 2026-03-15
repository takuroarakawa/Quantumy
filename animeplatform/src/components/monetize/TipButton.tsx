"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, X, Loader2 } from "lucide-react";
import { TIP_AMOUNTS } from "@/lib/stripe";

interface TipButtonProps {
  creatorId: string;
  creatorName: string;
}

export function TipButton({ creatorId, creatorName }: TipButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleTip = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount < 100) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, creatorId, message }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setIsDone(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsDone(false);
          setSelectedAmount(null);
          setMessage("");
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f59e0b] to-[#ef4444] hover:opacity-90 text-white font-bold rounded-xl transition-all hover:scale-105"
      >
        <Heart className="w-4 h-4 fill-current" />
        投げ銭する
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-[#2a2a3e] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">
                <span className="text-gradient">{creatorName}</span> を応援する
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-[#6b7280] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDone ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🎉</div>
                <p className="font-bold text-lg">ありがとう！</p>
                <p className="text-[#6b7280] text-sm mt-1">投げ銭が送られました</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#6b7280] mb-4">
                  クリエイターに直接届きます。あなたの応援が次の話を生む。
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {TIP_AMOUNTS.map((tip) => (
                    <button
                      key={tip.amount}
                      onClick={() => {
                        setSelectedAmount(tip.amount);
                        setCustomAmount("");
                      }}
                      className={`flex flex-col items-center py-3 rounded-xl border transition-all ${
                        selectedAmount === tip.amount
                          ? "bg-[#7c3aed]/20 border-[#7c3aed] text-white"
                          : "bg-[#0a0a0f] border-[#2a2a3e] text-[#6b7280] hover:border-[#7c3aed]/40"
                      }`}
                    >
                      <span className="text-xl mb-1">{tip.emoji}</span>
                      <span className="text-sm font-bold">{tip.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <input
                    type="number"
                    placeholder="金額を直接入力（最低100円）"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] transition-colors"
                  />
                </div>

                <div className="mb-5">
                  <textarea
                    placeholder="メッセージ（任意）"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handleTip}
                  disabled={isLoading || (!selectedAmount && !customAmount)}
                  className="w-full py-3 bg-gradient-to-r from-[#f59e0b] to-[#ef4444] text-white font-bold rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Heart className="w-4 h-4 fill-current" />
                      {selectedAmount
                        ? `${selectedAmount.toLocaleString()}円を贈る`
                        : customAmount
                        ? `${parseInt(customAmount).toLocaleString()}円を贈る`
                        : "金額を選択"}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
