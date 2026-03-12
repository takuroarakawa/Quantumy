"use client";

import { useState } from "react";
import type { Locale } from "../lib/i18n";

type IdeaInputFormProps = {
  locale: Locale;
};

type ApiResult = {
  entry: {
    title: string;
    date: string;
  };
};

export default function IdeaInputForm({ locale }: IdeaInputFormProps) {
  const [idea, setIdea] = useState("");
  const [author, setAuthor] = useState("Takuro Arakawa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResult | null>(null);

  const text = {
    ja: {
      title: "日次アイデア入力",
      hint: "今日の着想を入力すると、開発ログとして自動保存されます。",
      author: "記録名（任意）",
      idea: "アイデア本文",
      placeholder:
        "例: 論文アップロード時にライセンス種別を必須選択にし、CC BY以外は商用公開フローを分岐する",
      submit: "ログ化する",
      success: "保存完了。開発ログに追加されました。",
      link: "開発ログを見る",
      error: "保存に失敗しました。少し時間をおいて再実行してください。",
    },
    en: {
      title: "Daily idea input",
      hint: "Submit today's idea and it is automatically stored as a development log.",
      author: "Author label (optional)",
      idea: "Idea body",
      placeholder:
        "Example: Require license type at paper upload and branch release flow if not CC BY",
      submit: "Create log",
      success: "Saved. Added to development logs.",
      link: "Open dev logs",
      error: "Failed to save. Please retry in a moment.",
    },
  }[locale];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          locale,
          author,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = (await response.json()) as ApiResult;
      setResult(data);
      setIdea("");
    } catch {
      setError(text.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>{text.title}</h2>
      <p className="muted">{text.hint}</p>

      <form onSubmit={onSubmit} className="stack">
        <label className="field">
          <span>{text.author}</span>
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            maxLength={80}
          />
        </label>

        <label className="field">
          <span>{text.idea}</span>
          <textarea
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder={text.placeholder}
            rows={8}
            minLength={10}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "..." : text.submit}
        </button>
      </form>

      {result ? (
        <p className="ok">
          {text.success}{" "}
          <a href={`/${locale}/logs`}>
            {text.link}: {result.entry.title} ({result.entry.date})
          </a>
        </p>
      ) : null}

      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
