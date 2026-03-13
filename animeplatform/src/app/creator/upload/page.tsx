"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Upload,
  Film,
  Plus,
  Trash2,
  ArrowLeft,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { GENRES } from "@/lib/utils";

interface EpisodeForm {
  title: string;
  description: string;
  episodeNumber: number;
  videoUrl: string;
  isFree: boolean;
}

export default function CreatorUploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [seriesForm, setSeriesForm] = useState({
    title: "",
    titleEn: "",
    description: "",
    genre: GENRES[0],
    tags: "",
    coverImage: "",
    status: "ongoing",
  });

  const [episodes, setEpisodes] = useState<EpisodeForm[]>([
    { title: "第1話", description: "", episodeNumber: 1, videoUrl: "", isFree: true },
  ]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-[#2a2a3e] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">ログインが必要です</h2>
          <p className="text-[#6b7280] text-sm mb-6">作品を投稿するにはログインしてください</p>
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-[#7c3aed] text-white rounded-xl font-medium hover:bg-[#6d28d9] transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  const addEpisode = () => {
    setEpisodes([
      ...episodes,
      {
        title: `第${episodes.length + 1}話`,
        description: "",
        episodeNumber: episodes.length + 1,
        videoUrl: "",
        isFree: false,
      },
    ]);
  };

  const removeEpisode = (index: number) => {
    if (episodes.length <= 1) return;
    setEpisodes(episodes.filter((_, i) => i !== index).map((ep, i) => ({ ...ep, episodeNumber: i + 1 })));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...seriesForm,
          tags: seriesForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
          episodes,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        const data = await response.json();
        setTimeout(() => router.push(`/series/${data.id}`), 2000);
      }
    } catch (error) {
      console.error(error);
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-[fadeIn_0.5s_ease-out]">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">投稿完了！</h2>
          <p className="text-[#6b7280]">作品ページに移動します...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-[#6b7280] hover:text-[#e8e8f0] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#a78bfa]" />
              作品を投稿する
            </h1>
            <p className="text-[#6b7280] text-sm">話数の制限なし。あなたの物語を自由に。</p>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s
                    ? "bg-[#7c3aed] text-white"
                    : step > s
                    ? "bg-green-500 text-white"
                    : "bg-[#2a2a3e] text-[#6b7280]"
                }`}
              >
                {s}
              </button>
              <span className={`text-sm ${step === s ? "text-[#e8e8f0]" : "text-[#6b7280]"}`}>
                {s === 1 ? "シリーズ情報" : "エピソード"}
              </span>
              {s < 2 && <div className="w-8 h-px bg-[#2a2a3e] mx-2" />}
            </div>
          ))}
        </div>

        {/* Step 1: シリーズ情報 */}
        {step === 1 && (
          <div className="space-y-5 animate-[slideUp_0.3s_ease-out]">
            <div className="p-6 bg-[#12121a] border border-[#2a2a3e] rounded-2xl space-y-5">
              <div>
                <label className="block text-sm text-[#6b7280] mb-1.5">
                  タイトル <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={seriesForm.title}
                  onChange={(e) => setSeriesForm({ ...seriesForm, title: e.target.value })}
                  placeholder="作品タイトル"
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-[#6b7280] mb-1.5">英語タイトル（任意）</label>
                <input
                  type="text"
                  value={seriesForm.titleEn}
                  onChange={(e) => setSeriesForm({ ...seriesForm, titleEn: e.target.value })}
                  placeholder="Title in English"
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-[#6b7280] mb-1.5">
                  あらすじ <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={seriesForm.description}
                  onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                  placeholder="作品のあらすじ・コンセプトを書いてください..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#6b7280] mb-1.5">ジャンル</label>
                  <select
                    value={seriesForm.genre}
                    onChange={(e) => setSeriesForm({ ...seriesForm, genre: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl text-sm focus:outline-none focus:border-[#7c3aed] transition-colors"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#6b7280] mb-1.5">ステータス</label>
                  <select
                    value={seriesForm.status}
                    onChange={(e) => setSeriesForm({ ...seriesForm, status: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl text-sm focus:outline-none focus:border-[#7c3aed] transition-colors"
                  >
                    <option value="ongoing">連載中</option>
                    <option value="completed">完結</option>
                    <option value="hiatus">休止中</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#6b7280] mb-1.5">
                  タグ（カンマ区切り）
                </label>
                <input
                  type="text"
                  value={seriesForm.tags}
                  onChange={(e) => setSeriesForm({ ...seriesForm, tags: e.target.value })}
                  placeholder="短編, 実験的, 青春, SF..."
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-[#6b7280] mb-1.5">カバー画像URL（任意）</label>
                <input
                  type="url"
                  value={seriesForm.coverImage}
                  onChange={(e) => setSeriesForm({ ...seriesForm, coverImage: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] transition-colors"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!seriesForm.title || !seriesForm.description}
              className="w-full py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ：エピソードを追加 →
            </button>
          </div>
        )}

        {/* Step 2: エピソード */}
        {step === 2 && (
          <div className="space-y-4 animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#6b7280]">
                <span className="text-[#a78bfa] font-bold">話数は自由</span> — 1話でも100話でも
              </p>
              <button
                onClick={addEpisode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed]/20 hover:bg-[#7c3aed]/30 text-[#a78bfa] text-sm rounded-lg border border-[#7c3aed]/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                話を追加
              </button>
            </div>

            {episodes.map((ep, index) => (
              <div
                key={index}
                className="p-5 bg-[#12121a] border border-[#2a2a3e] rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">第{ep.episodeNumber}話</h3>
                  {episodes.length > 1 && (
                    <button
                      onClick={() => removeEpisode(index)}
                      className="text-[#6b7280] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={ep.title}
                    onChange={(e) => {
                      const updated = [...episodes];
                      updated[index].title = e.target.value;
                      setEpisodes(updated);
                    }}
                    placeholder="エピソードタイトル"
                    className="px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] transition-colors"
                  />
                  <input
                    type="url"
                    value={ep.videoUrl}
                    onChange={(e) => {
                      const updated = [...episodes];
                      updated[index].videoUrl = e.target.value;
                      setEpisodes(updated);
                    }}
                    placeholder="動画URL（YouTube, Vimeo等）"
                    className="px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed] transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`free-${index}`}
                    checked={ep.isFree}
                    onChange={(e) => {
                      const updated = [...episodes];
                      updated[index].isFree = e.target.checked;
                      setEpisodes(updated);
                    }}
                    className="rounded"
                  />
                  <label htmlFor={`free-${index}`} className="text-sm text-[#6b7280]">
                    無料公開
                  </label>
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-[#12121a] border border-[#2a2a3e] hover:border-[#7c3aed]/40 font-medium rounded-xl transition-all"
              >
                ← 戻る
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-2 flex-1 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    作品を公開する
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
