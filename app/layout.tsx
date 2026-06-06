import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whisper",
  description: "여러분도 누군가에게 Whisper가 되어주세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* IBM Plex Mono — 타자기 계열, 한/영 모두 지원 */}
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;1,300;1,400&family=IBM+Plex+Sans+KR:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-light antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
