import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WithAuth } from "@/middleware/WithAuth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "在线播放平台",
  description: "在线播放推流管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WithAuth>
          {children}
        </WithAuth>
      </body>
    </html>
  );
}
