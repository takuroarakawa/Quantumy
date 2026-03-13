"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, User, LogOut, PlusCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#0a0a0f] to-transparent backdrop-blur-sm border-b border-[#2a2a3e]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] flex items-center justify-center font-bold text-white text-sm">
              E
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-[#a78bfa]">Elementary</span>
            </span>
          </Link>

          {/* ナビゲーションリンク */}
          <div className="hidden md:flex items-center gap-6 text-sm text-[#6b7280]">
            <Link href="/" className="hover:text-[#e8e8f0] transition-colors">
              ホーム
            </Link>
            <Link href="/series" className="hover:text-[#e8e8f0] transition-colors">
              作品一覧
            </Link>
            <Link href="/creator" className="hover:text-[#e8e8f0] transition-colors">
              クリエイター
            </Link>
          </div>

          {/* 検索バー */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
              <input
                type="text"
                placeholder="作品・クリエイターを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#12121a] border border-[#2a2a3e] rounded-full text-sm text-[#e8e8f0] placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] w-64 transition-all"
              />
            </div>
          </form>

          {/* 右側アクション */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/creator/upload"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm rounded-lg font-medium transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  投稿する
                </Link>
                <button className="text-[#6b7280] hover:text-[#e8e8f0] transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 text-sm text-[#e8e8f0]"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#f59e0b] flex items-center justify-center text-white font-medium text-xs">
                      {session.user?.name?.[0] || "U"}
                    </div>
                    <ChevronDown className="w-3 h-3 text-[#6b7280]" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a26] border border-[#2a2a3e] rounded-xl shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#2a2a3e]">
                        <p className="text-sm font-medium">{session.user?.name}</p>
                        <p className="text-xs text-[#6b7280]">{session.user?.email}</p>
                      </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#2a2a3e] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                ダッシュボード
              </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-[#2a2a3e] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm rounded-lg font-medium transition-colors"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
