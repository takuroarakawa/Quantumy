/**
 * Next.js Instrumentation Hook
 * サーバー起動時に一度だけ実行される。
 * prom-client のレジストリ初期化はここで行う。
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Node.js ランタイムでのみ prom-client を初期化
    const { register: promRegister } = await import("./lib/metrics");
    console.log(
      "[Elementary] Prometheus metrics initialized:",
      (await promRegister.getMetricsAsJSON()).length,
      "metrics registered"
    );
  }
}
