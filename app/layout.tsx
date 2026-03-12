import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dr.CANVAS Knowledge Base",
  description: "Multilingual operating hub for Dr.CANVAS",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
