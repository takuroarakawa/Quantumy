"use client";

import { useEffect, useMemo, useState } from "react";

type Citation = {
  id: string;
  title: string;
  authors: string;
  year: number;
  doi: string;
  summary: string;
};

type MangaPage = {
  id: number;
  chapter: string;
  sceneTitle: string;
  narration: string;
  steamFocus: string;
  citationIds: string[];
};

const citations: Citation[] = [
  {
    id: "c1",
    title: "Cognitive Load Theory and Instructional Design",
    authors: "Sweller, J.",
    year: 2011,
    doi: "10.1007/978-1-4419-8126-4_2",
    summary: "読者の情報負荷を制御し、理解を最大化するレイアウト設計の基礎。",
  },
  {
    id: "c2",
    title: "Narrative Transportation and Persuasion",
    authors: "Green, M. C. & Brock, T. C.",
    year: 2000,
    doi: "10.1037/0022-3514.79.5.701",
    summary: "物語への没入が学習態度・記憶形成に与える影響を示した代表研究。",
  },
  {
    id: "c3",
    title: "Deliberate Practice in STEM Education",
    authors: "Ericsson, K. A. et al.",
    year: 2008,
    doi: "10.1016/j.learninstruc.2007.08.004",
    summary: "反復・即時フィードバック・難易度調整を伴う熟達化プロセスの検証。",
  },
  {
    id: "c4",
    title: "Visual Storytelling for Scientific Communication",
    authors: "Cairo, A.",
    year: 2016,
    doi: "10.1145/3001328.3001332",
    summary: "図像と言語を連携させることで理解精度が向上するデザイン原則。",
  },
];

const pages: MangaPage[] = [
  {
    id: 1,
    chapter: "第1話 量子の診察室",
    sceneTitle: "異常値の発見",
    narration:
      "患者データに隠れたパターンが崩れた。ドクターは“仮説”を立てる。",
    steamFocus: "Science: 仮説立案 / 異常検知",
    citationIds: ["c1", "c4"],
  },
  {
    id: 2,
    chapter: "第1話 量子の診察室",
    sceneTitle: "検証プロトコル",
    narration:
      "観測条件を変え、対照群と比較する。実験計画の正確さが勝負を分ける。",
    steamFocus: "Engineering: 実験設計 / 制約下最適化",
    citationIds: ["c1", "c3"],
  },
  {
    id: 3,
    chapter: "第1話 量子の診察室",
    sceneTitle: "逆転の可視化",
    narration:
      "データは物語になる。因果の流れを1枚の図に落とし込み、真因へ迫る。",
    steamFocus: "Technology + Art: 可視化 / ナラティブ構成",
    citationIds: ["c2", "c4"],
  },
  {
    id: 4,
    chapter: "第1話 量子の診察室",
    sceneTitle: "次話への処方箋",
    narration:
      "結論は出た。しかし未知の変数が残る。新章へのクリフハンガーが走る。",
    steamFocus: "Mathematics: 推定誤差 / 次の問いの定式化",
    citationIds: ["c2", "c3"],
  },
];

export function DoctorCanvasPrototype() {
  const [pageIndex, setPageIndex] = useState(0);
  const [isMobileCitationOpen, setIsMobileCitationOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const currentPage = pages[pageIndex];

  const goNextPage = () => {
    setPageIndex((prev) => Math.min(prev + 1, pages.length - 1));
  };

  const goPrevPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const jumpToPage = (index: number) => {
    setPageIndex(index);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInputLike =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.getAttribute("contenteditable") === "true";

      if (isInputLike) {
        return;
      }

      if (event.key === "ArrowRight") {
        goNextPage();
      }
      if (event.key === "ArrowLeft") {
        goPrevPage();
      }
      if (event.key.toLowerCase() === "c") {
        setIsMobileCitationOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setIsMobileCitationOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const relatedCitations = useMemo(
    () => citations.filter((citation) => currentPage.citationIds.includes(citation.id)),
    [currentPage.citationIds],
  );

  const progress = ((pageIndex + 1) / pages.length) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Doctor Canvas</p>
            <h1 className="text-lg font-semibold sm:text-xl">漫画版岩波文庫 / Quantumy Phase 1</h1>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <p className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
              ← → で移動 / Cで引用
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 pb-28 sm:px-6 sm:pb-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-400">{currentPage.chapter}</p>
                <h2 className="text-xl font-semibold">{currentPage.sceneTitle}</h2>
              </div>
              <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-200">
                STEAM Focus: {currentPage.steamFocus}
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between gap-2 sm:hidden">
              <button
                type="button"
                onClick={goPrevPage}
                disabled={pageIndex === 0}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 disabled:opacity-40"
              >
                前へ
              </button>
              <button
                type="button"
                onClick={() => setIsMobileCitationOpen(true)}
                className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100"
              >
                出典を見る
              </button>
              <button
                type="button"
                onClick={goNextPage}
                disabled={pageIndex === pages.length - 1}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 disabled:opacity-40"
              >
                次へ
              </button>
            </div>

            <div
              className="relative mx-auto flex max-w-[780px] items-center justify-center"
              onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
              onTouchEnd={(event) => {
                if (touchStartX === null) return;
                const endX = event.changedTouches[0]?.clientX ?? touchStartX;
                const deltaX = endX - touchStartX;
                const swipeThreshold = 42;
                if (deltaX < -swipeThreshold) {
                  goNextPage();
                } else if (deltaX > swipeThreshold) {
                  goPrevPage();
                }
                setTouchStartX(null);
              }}
            >
              <button
                type="button"
                aria-label="前のページ"
                onClick={goPrevPage}
                disabled={pageIndex === 0}
                className="absolute left-0 z-10 hidden h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm text-slate-200 transition hover:border-cyan-400/70 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-40 md:flex"
              >
                ←
              </button>

              <article
                aria-live="polite"
                className="aspect-[2/3] w-full rounded-2xl border border-slate-700 bg-gradient-to-br from-zinc-100 to-zinc-300 p-4 text-zinc-900 shadow-[0_30px_90px_-35px_rgba(34,211,238,0.55)] sm:p-5"
              >
                <div className="grid h-full grid-cols-2 gap-3">
                  <div className="rounded-xl border-2 border-zinc-900 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Panel 1
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-tight">{currentPage.sceneTitle}</h3>
                    <p className="mt-3 text-sm leading-6">{currentPage.narration}</p>
                  </div>
                  <div className="rounded-xl border-2 border-zinc-900 bg-zinc-200 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                      Panel 2
                    </p>
                    <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm leading-6 shadow-sm">
                      「出典の根拠は？」
                      <br />
                      サイドバーで即参照できる設計にする。
                    </p>
                  </div>
                  <div className="col-span-2 rounded-xl border-2 border-zinc-900 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Panel 3 / Doctor Note
                    </p>
                    <p className="mt-3 text-sm leading-7">
                      読解フロー: 「物語で没入 → 論文で根拠確認 → 次ページで再解釈」。
                      <span className="font-semibold"> STEAM思考と漫画的テンポ</span>
                      を往復させ、理解を能動化する。
                    </p>
                  </div>
                </div>
              </article>

              <button
                type="button"
                aria-label="次のページ"
                onClick={goNextPage}
                disabled={pageIndex === pages.length - 1}
                className="absolute right-0 z-10 hidden h-10 w-10 translate-x-1/2 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm text-slate-200 transition hover:border-cyan-400/70 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-40 md:flex"
              >
                →
              </button>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                <span>
                  Page {pageIndex + 1} / {pages.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-valuemin={1} aria-valuemax={pages.length} aria-valuenow={pageIndex + 1}>
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="mb-3 text-sm font-medium text-slate-300">ページ一覧</p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => jumpToPage(index)}
                  className={`rounded-xl border p-3 text-left transition ${
                    index === pageIndex
                      ? "border-cyan-300 bg-cyan-500/10 text-cyan-100"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                  }`}
                  aria-current={index === pageIndex ? "page" : undefined}
                >
                  <p className="text-xs text-slate-400">Page {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold">{page.sceneTitle}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 lg:sticky lg:top-20 lg:block lg:h-fit">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Citation Sidebar</p>
          <h2 className="mt-2 text-lg font-semibold">出典 / 論文リファレンス</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            現在のページに関連する論文を表示。漫画の読後に根拠へ即ジャンプできる
            「漫画版岩波文庫」体験を想定しています。
          </p>

          <div className="mt-4 space-y-3">
            {relatedCitations.map((citation) => (
              <article key={citation.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                <h3 className="text-sm font-semibold leading-6 text-slate-100">{citation.title}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {citation.authors} ({citation.year})
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-300">{citation.summary}</p>
                <a
                  href={`https://doi.org/${citation.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex rounded-md border border-cyan-400/40 px-2.5 py-1.5 text-xs text-cyan-200 transition hover:border-cyan-200 hover:text-cyan-100"
                >
                  DOI: {citation.doi}
                </a>
              </article>
            ))}
          </div>
        </aside>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-2">
          <button
            type="button"
            onClick={goPrevPage}
            disabled={pageIndex === 0}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 disabled:opacity-40"
          >
            ← 前ページ
          </button>
          <button
            type="button"
            onClick={() => setIsMobileCitationOpen(true)}
            className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100"
          >
            引用を開く
          </button>
          <button
            type="button"
            onClick={goNextPage}
            disabled={pageIndex === pages.length - 1}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 disabled:opacity-40"
          >
            次ページ →
          </button>
        </div>
      </div>

      {isMobileCitationOpen ? (
        <div className="fixed inset-0 z-40 flex items-end bg-slate-950/70 p-3 lg:hidden" role="dialog" aria-modal="true" aria-label="引用一覧">
          <div className="max-h-[82vh] w-full overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">出典 / 論文リファレンス</h2>
              <button
                type="button"
                onClick={() => setIsMobileCitationOpen(false)}
                className="rounded-md border border-slate-600 px-2.5 py-1 text-xs text-slate-200"
              >
                閉じる
              </button>
            </div>
            <p className="text-xs leading-6 text-slate-300">
              Page {pageIndex + 1} に関連する論文です。漫画を読みながら根拠へ即アクセスできます。
            </p>
            <div className="mt-3 space-y-3">
              {relatedCitations.map((citation) => (
                <article key={citation.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                  <h3 className="text-sm font-semibold leading-6 text-slate-100">{citation.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {citation.authors} ({citation.year})
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{citation.summary}</p>
                  <a
                    href={`https://doi.org/${citation.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex rounded-md border border-cyan-400/40 px-2.5 py-1.5 text-xs text-cyan-200"
                  >
                    DOI: {citation.doi}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
