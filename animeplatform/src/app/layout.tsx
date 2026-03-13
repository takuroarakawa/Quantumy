import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { UnifiedHeader } from "@/components/layout/UnifiedHeader";
import { PageTransition } from "@/components/layout/PageTransition";

export const metadata: Metadata = {
  title: "Elementary — 自由なアニメプラットフォーム",
  description:
    "12話の縛りを超えて。日本初のクリエイターファーストアニメ配信プラットフォーム。あなたの物語を、あなたのペースで。",
  keywords: ["アニメ", "配信", "クリエイター", "インディー", "自由", "短編", "オリジナル"],
  openGraph: {
    title: "Elementary",
    description: "12話の縛りを超えて。自由なアニメ表現を。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0f] text-[#e8e8f0] min-h-screen">
        <SessionProvider>
          <UnifiedHeader />
          <Navbar />
          <main className="pt-24">
            <PageTransition>{children}</PageTransition>
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
