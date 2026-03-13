import { NextRequest, NextResponse } from "next/server";

/**
 * HTTPリクエストメトリクスのミドルウェア
 *
 * Edge Runtime では prom-client が使えないため、
 * カスタムヘッダー経由で開始時刻を渡し、
 * /api/metrics ルート内でObserveする設計。
 *
 * 実際のメトリクス記録は instrumentation.ts（Node.js Runtime）で行う。
 */
export function middleware(request: NextRequest) {
  // /api/metrics へのアクセスは内部IPのみ許可（本番では制限すること）
  if (request.nextUrl.pathname === "/api/metrics") {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    // 開発環境は全許可、本番ではPrometheusサーバーのIPに限定
    const isAllowed =
      process.env.NODE_ENV === "development" ||
      clientIp.startsWith("172.") ||
      clientIp.startsWith("10.") ||
      clientIp === "127.0.0.1" ||
      clientIp === "::1";

    if (!isAllowed) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // リクエスト開始時刻をヘッダーに埋め込む（レスポンスタイム計測用）
  const requestStart = Date.now().toString();
  const response = NextResponse.next();
  response.headers.set("x-request-start", requestStart);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
