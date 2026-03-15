import { NextResponse } from "next/server";
import { register } from "@/lib/metrics";

/**
 * GET /api/metrics
 * Prometheus スクレイプエンドポイント
 *
 * Prometheus の scrape_configs でこのURLを指定:
 *   - job_name: "elementary-app"
 *     metrics_path: /api/metrics
 *     static_configs:
 *       - targets: ["172.18.0.1:3000"]
 */
export async function GET() {
  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    headers: {
      "Content-Type": register.contentType,
      "Cache-Control": "no-store, no-cache",
    },
  });
}
