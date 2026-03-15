"use client";

import { useEffect, useMemo, useState } from "react";

type CitationReference = {
  citationId: string;
  pinpoint: string;
};

type MangaPanel = {
  id: string;
  label: string;
  body: string;
  references: CitationReference[];
};

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
  steamFocus: string;
  citationIds: string[];
  panels: MangaPanel[];
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
    steamFocus: "Science: 仮説立案 / 異常検知",
    citationIds: ["c1", "c4"],
    panels: [
      {
        id: "p1a",
        label: "Panel 1",
        body: "患者データに隠れたパターンが崩れた。ドクターは“仮説”を立てる。",
        references: [
          {
            citationId: "c1",
            pinpoint: "認知負荷を抑える導入順序",
          },
        ],
      },
      {
        id: "p1b",
        label: "Panel 2",
        body: "異常値はノイズか兆候か。比較対象の選び方で結論が反転する。",
        references: [
          {
            citationId: "c4",
            pinpoint: "視覚要素で異常の意味づけを補強",
          },
        ],
      },
      {
        id: "p1c",
        label: "Panel 3 / Doctor Note",
        body: "「直感→仮説→言語化」の順で進めると読者の離脱が減る。",
        references: [
          {
            citationId: "c1",
            pinpoint: "段階的提示による理解支援",
          },
          {
            citationId: "c4",
            pinpoint: "図解を使った概念固定",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    chapter: "第1話 量子の診察室",
    sceneTitle: "検証プロトコル",
    steamFocus: "Engineering: 実験設計 / 制約下最適化",
    citationIds: ["c1", "c3"],
    panels: [
      {
        id: "p2a",
        label: "Panel 1",
        body: "観測条件を変え、対照群と比較する。実験計画の正確さが勝負を分ける。",
        references: [
          {
            citationId: "c3",
            pinpoint: "反復設計と即時フィードバック",
          },
        ],
      },
      {
        id: "p2b",
        label: "Panel 2",
        body: "制約時間内で検証回数を最大化するには、何を先に切るべきか。",
        references: [
          {
            citationId: "c1",
            pinpoint: "不要情報の削減と手順最適化",
          },
        ],
      },
      {
        id: "p2c",
        label: "Panel 3 / Doctor Note",
        body: "読者に『次は自分でも試せる』感覚を残すのが教育的な余韻。",
        references: [
          {
            citationId: "c3",
            pinpoint: "熟達を促す課題分割",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    chapter: "第1話 量子の診察室",
    sceneTitle: "逆転の可視化",
    steamFocus: "Technology + Art: 可視化 / ナラティブ構成",
    citationIds: ["c2", "c4"],
    panels: [
      {
        id: "p3a",
        label: "Panel 1",
        body: "データは物語になる。因果の流れを1枚の図に落とし込み、真因へ迫る。",
        references: [
          {
            citationId: "c4",
            pinpoint: "可視化の文法で因果を明瞭化",
          },
        ],
      },
      {
        id: "p3b",
        label: "Panel 2",
        body: "読者の視線誘導を設計し、理解の順番そのものを演出する。",
        references: [
          {
            citationId: "c2",
            pinpoint: "没入を生む物語輸送理論",
          },
        ],
      },
      {
        id: "p3c",
        label: "Panel 3 / Doctor Note",
        body: "“わかった気”を“説明できる”へ変えるには、根拠表示の即時性が鍵。",
        references: [
          {
            citationId: "c2",
            pinpoint: "態度変容と記憶保持への影響",
          },
          {
            citationId: "c4",
            pinpoint: "科学コミュニケーションの図像原則",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    chapter: "第1話 量子の診察室",
    sceneTitle: "次話への処方箋",
    steamFocus: "Mathematics: 推定誤差 / 次の問いの定式化",
    citationIds: ["c2", "c3"],
    panels: [
      {
        id: "p4a",
        label: "Panel 1",
        body: "結論は出た。しかし未知の変数が残る。新章へのクリフハンガーが走る。",
        references: [
          {
            citationId: "c2",
            pinpoint: "次話への期待を高める叙述構造",
          },
        ],
      },
      {
        id: "p4b",
        label: "Panel 2",
        body: "誤差を隠さず示すことで、問いの品質そのものを一段上げる。",
        references: [
          {
            citationId: "c3",
            pinpoint: "評価軸を明示した反復改善",
          },
        ],
      },
      {
        id: "p4c",
        label: "Panel 3 / Doctor Note",
        body: "読解フロー: 物語で没入 → 論文で根拠確認 → 次ページで再解釈。",
        references: [
          {
            citationId: "c2",
            pinpoint: "没入と再解釈の往復",
          },
          {
            citationId: "c3",
            pinpoint: "継続学習を促す設計",
          },
        ],
      },
    ],
  },
];

type ReadingMode = "paged" | "continuous";

type CitationMention = {
  key: string;
  citationId: string;
  pageId: number;
  pageIndex: number;
  panelId: string;
  panelLabel: string;
  pinpoint: string;
};

const getMentionKey = (
  pageId: number,
  panelId: string,
  citationId: string,
  referenceIndex: number,
) => `${pageId}-${panelId}-${citationId}-${referenceIndex}`;

export function DoctorCanvasPrototype() {
  const [pageIndex, setPageIndex] = useState(0);
  const [readingMode, setReadingMode] = useState<ReadingMode>("paged");
  const [isMobileCitationOpen, setIsMobileCitationOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [selectedMentionKey, setSelectedMentionKey] = useState<string | null>(null);
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

  const openCitationOnMobile = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setIsMobileCitationOpen(true);
    }
  };

  const focusPanelById = (pageId: number, panelId: string) => {
    if (typeof document === "undefined") {
      return;
    }
    window.requestAnimationFrame(() => {
      const panel = document.getElementById(`panel-${pageId}-${panelId}`);
      if (!panel) {
        return;
      }
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
      if (panel instanceof HTMLElement) {
        panel.focus();
      }
    });
  };

  const onPanelReferenceSelect = (
    targetPageIndex: number,
    targetPageId: number,
    panelId: string,
    reference: CitationReference,
    referenceIndex: number,
  ) => {
    setPageIndex(targetPageIndex);
    setSelectedCitationId(reference.citationId);
    setSelectedMentionKey(
      getMentionKey(targetPageId, panelId, reference.citationId, referenceIndex),
    );
    openCitationOnMobile();
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
        setPageIndex((prev) => Math.min(prev + 1, pages.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setPageIndex((prev) => Math.max(prev - 1, 0));
      }
      if (event.key.toLowerCase() === "c") {
        setIsMobileCitationOpen((prev) => !prev);
      }
      if (event.key.toLowerCase() === "m") {
        setReadingMode((prev) => (prev === "paged" ? "continuous" : "paged"));
      }
      if (event.key === "Escape") {
        setIsMobileCitationOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const relatedCitations = useMemo(
    () => {
      const sourcePages = readingMode === "paged" ? [currentPage] : pages;
      const citationIds = new Set(sourcePages.flatMap((page) => page.citationIds));
      return citations.filter((citation) => citationIds.has(citation.id));
    },
    [currentPage, readingMode],
  );

  const mentionsByCitation = useMemo(() => {
    const sourcePages = readingMode === "paged" ? [currentPage] : pages;
    const result: Record<string, CitationMention[]> = {};

    sourcePages.forEach((page) => {
      const targetPageIndex = pages.findIndex((item) => item.id === page.id);
      page.panels.forEach((panel) => {
        panel.references.forEach((reference, referenceIndex) => {
          const mention: CitationMention = {
            key: getMentionKey(page.id, panel.id, reference.citationId, referenceIndex),
            citationId: reference.citationId,
            pageId: page.id,
            pageIndex: targetPageIndex,
            panelId: panel.id,
            panelLabel: panel.label,
            pinpoint: reference.pinpoint,
          };

          if (!result[reference.citationId]) {
            result[reference.citationId] = [];
          }
          result[reference.citationId].push(mention);
        });
      });
    });
    return result;
  }, [currentPage, readingMode]);

  const progress = ((pageIndex + 1) / pages.length) * 100;

  const renderPanelCard = (
    page: MangaPage,
    targetPageIndex: number,
    panel: MangaPanel,
    panelIndex: number,
  ) => (
    <article
      id={`panel-${page.id}-${panel.id}`}
      key={`${page.id}-${panel.id}`}
      tabIndex={0}
      role="button"
      aria-label={`${page.sceneTitle} ${panel.label}`}
      onClick={() => {
        const firstReference = panel.references[0];
        if (firstReference) {
          onPanelReferenceSelect(targetPageIndex, page.id, panel.id, firstReference, 0);
          return;
        }
        setPageIndex(targetPageIndex);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const firstReference = panel.references[0];
          if (firstReference) {
            onPanelReferenceSelect(targetPageIndex, page.id, panel.id, firstReference, 0);
            return;
          }
          setPageIndex(targetPageIndex);
        }
      }}
      className={`rounded-xl border-2 border-zinc-900 bg-white p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
        panelIndex === 2 ? "col-span-2" : ""
      } ${
        selectedMentionKey?.startsWith(`${page.id}-${panel.id}-`)
          ? "ring-2 ring-cyan-500"
          : "hover:bg-zinc-100"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {panel.label}
      </p>
      <p className="mt-2 text-sm leading-6">{panel.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {panel.references.map((reference, referenceIndex) => {
          const mentionKey = getMentionKey(
            page.id,
            panel.id,
            reference.citationId,
            referenceIndex,
          );
          return (
            <button
              key={mentionKey}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPanelReferenceSelect(
                  targetPageIndex,
                  page.id,
                  panel.id,
                  reference,
                  referenceIndex,
                );
              }}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                selectedMentionKey === mentionKey
                  ? "border-cyan-500 bg-cyan-100 text-cyan-900"
                  : "border-zinc-300 bg-zinc-50 text-zinc-700 hover:border-zinc-500"
              }`}
            >
              出典: {reference.citationId.toUpperCase()}
            </button>
          );
        })}
      </div>
    </article>
  );

  const renderCitationCards = (isMobile: boolean) => (
    <div className="mt-4 space-y-3">
      {relatedCitations.map((citation) => {
        const mentions = mentionsByCitation[citation.id] ?? [];
        const isHighlighted = selectedCitationId === citation.id;
        return (
          <article
            key={citation.id}
            className={`rounded-xl border bg-slate-950/60 p-3 transition ${
              isHighlighted
                ? "border-cyan-300 shadow-[0_0_0_1px_rgba(103,232,249,0.25)]"
                : "border-slate-700"
            }`}
          >
            <h3 className="text-sm font-semibold leading-6 text-slate-100">{citation.title}</h3>
            <p className="mt-1 text-xs text-slate-400">
              {citation.authors} ({citation.year})
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-300">{citation.summary}</p>

            <div className="mt-3 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/90">
                コマ連動ハイライト
              </p>
              {mentions.length === 0 ? (
                <p className="text-xs text-slate-400">この表示範囲では参照されていません。</p>
              ) : (
                mentions.map((mention) => (
                  <button
                    key={mention.key}
                    type="button"
                    onClick={() => {
                      setPageIndex(mention.pageIndex);
                      setSelectedCitationId(mention.citationId);
                      setSelectedMentionKey(mention.key);
                      focusPanelById(mention.pageId, mention.panelId);
                      if (isMobile) {
                        setIsMobileCitationOpen(false);
                      }
                    }}
                    className={`w-full rounded-md border px-2 py-1.5 text-left text-xs transition ${
                      selectedMentionKey === mention.key
                        ? "border-cyan-400 bg-cyan-500/15 text-cyan-100"
                        : "border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <span className="block text-[11px] text-slate-400">
                      Page {mention.pageId} / {mention.panelLabel}
                    </span>
                    <span className="block truncate">{mention.pinpoint}</span>
                  </button>
                ))
              )}
            </div>

            <a
              href={`https://doi.org/${citation.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex rounded-md border border-cyan-400/40 px-2.5 py-1.5 text-xs text-cyan-200 transition hover:border-cyan-200 hover:text-cyan-100"
            >
              DOI: {citation.doi}
            </a>
          </article>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Doctor Canvas</p>
            <h1 className="text-lg font-semibold sm:text-xl">漫画版岩波文庫 / Quantumy Phase 1</h1>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => setReadingMode("paged")}
                aria-pressed={readingMode === "paged"}
                className={`rounded-md px-3 py-1 text-xs ${
                  readingMode === "paged"
                    ? "bg-cyan-500/20 text-cyan-100"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                ページ読書
              </button>
              <button
                type="button"
                onClick={() => setReadingMode("continuous")}
                aria-pressed={readingMode === "continuous"}
                className={`rounded-md px-3 py-1 text-xs ${
                  readingMode === "continuous"
                    ? "bg-cyan-500/20 text-cyan-100"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                連続読書
              </button>
            </div>
            <p className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
              ← → で移動 / Cで引用 / Mでモード切替
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
                onClick={() =>
                  setReadingMode((prev) => (prev === "paged" ? "continuous" : "paged"))
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200"
              >
                {readingMode === "paged" ? "連続読書へ" : "ページ読書へ"}
              </button>
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

            {readingMode === "paged" ? (
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
                    {currentPage.panels.map((panel, panelIndex) =>
                      renderPanelCard(currentPage, pageIndex, panel, panelIndex),
                    )}
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
            ) : (
              <div className="mx-auto flex w-full max-w-[780px] flex-col gap-4">
                <p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
                  連続読書モード: ジャンプ+のように縦スクロールで読み進め、コマを押すと右の出典が強調表示されます。
                </p>
                {pages.map((page, index) => (
                  <article
                    key={page.id}
                    className={`rounded-2xl border bg-gradient-to-br from-zinc-100 to-zinc-300 p-4 text-zinc-900 shadow-[0_24px_60px_-36px_rgba(34,211,238,0.45)] sm:p-5 ${
                      index === pageIndex ? "border-cyan-300" : "border-slate-700"
                    }`}
                    onMouseEnter={() => setPageIndex(index)}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-zinc-600">Page {page.id}</p>
                      <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-100">
                        {page.sceneTitle}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {page.panels.map((panel, panelIndex) =>
                        renderPanelCard(page, index, panel, panelIndex),
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                <span>
                  {readingMode === "paged" ? "Page" : "Focus"} {pageIndex + 1} / {pages.length}
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
            {readingMode === "paged"
              ? "現在ページに関連する論文を表示。コマを押すと対応箇所がハイライトされます。"
              : "連続読書では章全体の論文を表示。引用側から該当コマへ逆ジャンプできます。"}
          </p>
          {renderCitationCards(false)}
        </aside>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex w-full max-w-[720px] flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() =>
              setReadingMode((prev) => (prev === "paged" ? "continuous" : "paged"))
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200"
          >
            {readingMode === "paged" ? "連続読書" : "ページ読書"}
          </button>
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
              {readingMode === "paged"
                ? `Page ${pageIndex + 1} に関連する論文です。漫画を読みながら根拠へ即アクセスできます。`
                : "連続読書モード: 章全体の引用を一覧表示しています。"}
            </p>
            {renderCitationCards(true)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
