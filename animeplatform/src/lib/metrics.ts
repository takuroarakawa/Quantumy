/**
 * Elementary — Prometheus メトリクスレジストリ
 *
 * シングルトンパターンで管理し、Next.js の Hot Reload 時に
 * "Registry already exists" エラーを防ぐ。
 */
import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from "prom-client";

declare global {
  // eslint-disable-next-line no-var
  var __promRegistry: Registry | undefined;
}

function createRegistry(): Registry {
  const register = new Registry();

  register.setDefaultLabels({ app: "elementary", env: process.env.NODE_ENV ?? "development" });

  // ── OS / Node.js デフォルトメトリクス ─────────────────────────
  collectDefaultMetrics({ register, prefix: "elementary_" });

  // ── HTTP リクエスト数 ──────────────────────────────────────────
  new Counter({
    name: "elementary_http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
    registers: [register],
  });

  // ── HTTP レスポンスタイム (histogram) ──────────────────────────
  new Histogram({
    name: "elementary_http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register],
  });

  // ── 動画視聴数 ─────────────────────────────────────────────────
  new Counter({
    name: "elementary_video_views_total",
    help: "Total video view events",
    labelNames: ["series_id", "episode_id"],
    registers: [register],
  });

  // ── 投げ銭トランザクション ────────────────────────────────────
  new Counter({
    name: "elementary_tips_total",
    help: "Total tip transactions",
    labelNames: ["currency"],
    registers: [register],
  });

  new Counter({
    name: "elementary_tip_amount_total",
    help: "Total tip amount in JPY",
    labelNames: ["currency"],
    registers: [register],
  });

  // ── アクティブサブスクリプション数 ──────────────────────────────
  new Gauge({
    name: "elementary_active_subscriptions",
    help: "Number of active creator subscriptions",
    labelNames: ["plan"],
    registers: [register],
  });

  // ── DB接続プール ──────────────────────────────────────────────
  new Gauge({
    name: "elementary_db_pool_size",
    help: "Current database connection pool size",
    registers: [register],
  });

  // ── 数式オブジェクトのタップ数 ────────────────────────────────
  new Counter({
    name: "elementary_math_object_taps_total",
    help: "Total taps on manga math objects",
    labelNames: ["page_id"],
    registers: [register],
  });

  return register;
}

// Next.js Hot Reload 対策: グローバルにレジストリを保持
if (!global.__promRegistry) {
  global.__promRegistry = createRegistry();
}

export const register = global.__promRegistry;

// ── ヘルパー: メトリクス値を増加させる ──────────────────────────

export function incrementHttpRequests(
  method: string,
  route: string,
  status: number
): void {
  try {
    const counter = register.getSingleMetric(
      "elementary_http_requests_total"
    ) as Counter<string>;
    counter.inc({ method, route, status: String(status) });
  } catch {
    // メトリクスが未初期化の場合は無視
  }
}

export function observeHttpDuration(
  method: string,
  route: string,
  status: number,
  durationSeconds: number
): void {
  try {
    const hist = register.getSingleMetric(
      "elementary_http_request_duration_seconds"
    ) as Histogram<string>;
    hist.observe({ method, route, status: String(status) }, durationSeconds);
  } catch {
    // ignore
  }
}

export function incrementVideoView(seriesId: string, episodeId: string): void {
  try {
    const counter = register.getSingleMetric(
      "elementary_video_views_total"
    ) as Counter<string>;
    counter.inc({ series_id: seriesId, episode_id: episodeId });
  } catch {
    // ignore
  }
}

export function incrementTip(amountJpy: number): void {
  try {
    const cnt = register.getSingleMetric("elementary_tips_total") as Counter<string>;
    cnt.inc({ currency: "jpy" });
    const amt = register.getSingleMetric("elementary_tip_amount_total") as Counter<string>;
    amt.inc({ currency: "jpy" }, amountJpy);
  } catch {
    // ignore
  }
}
