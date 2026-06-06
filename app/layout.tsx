import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘의 한 줄",
  description: "사랑과 인생에 관한 익명의 한 줄",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400&family=DM+Mono:wght@300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-light antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
