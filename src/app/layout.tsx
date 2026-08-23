import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "霍霍AI实训营 · 互动课堂",
  description: "实时投票、协作笔记、视频学习",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#0a0a0f] text-[#f0f0f5] min-h-screen">{children}</body>
    </html>
  );
}
