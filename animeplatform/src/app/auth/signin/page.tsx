"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, User, ArrowRight, Film } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      name,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/");
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0f]">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#7c3aed]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#f59e0b]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] flex items-center justify-center font-bold text-white">
              AF
            </div>
            <span className="font-bold text-2xl">
              Anime<span className="text-[#a78bfa]">FREE</span>
            </span>
          </Link>
          <p className="text-[#6b7280] text-sm mt-2">12話の縛りを超えて、自由なアニメ体験へ</p>
        </div>

        {/* カード */}
        <div className="bg-[#12121a] border border-[#2a2a3e] rounded-2xl p-8 shadow-2xl">
          <div className="flex gap-2 mb-6 p-1 bg-[#0a0a0f] rounded-xl">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-[#7c3aed] text-white"
                  : "text-[#6b7280] hover:text-[#e8e8f0]"
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-[#7c3aed] text-white"
                  : "text-[#6b7280] hover:text-[#e8e8f0]"
              }`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm text-[#6b7280] mb-1.5">ニックネーム</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="アニメファン"
                    className="w-full pl-10 pr-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-[#6b7280] mb-1.5">メールアドレス</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anime@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "ログイン" : "無料で始める"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2a2a3e]">
            <div className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-xl border border-[#2a2a3e]/50">
              <Film className="w-5 h-5 text-[#a78bfa] flex-shrink-0" />
              <p className="text-xs text-[#6b7280] leading-relaxed">
                AnimeFREEはクリエイターと視聴者が直接つながる、12話の縛りのない自由なアニメプラットフォームです。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
