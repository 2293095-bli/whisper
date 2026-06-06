import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 본문 · 제목: IBM Plex Mono (타자기 계열, 한/영 통일)
        mono:  ["'IBM Plex Mono'", "monospace"],
        // 본문 보조 (한글 가독성): IBM Plex Sans KR
        sans:  ["'IBM Plex Sans KR'", "sans-serif"],
        // serif alias → mono로 리다이렉트 (기존 클래스 호환)
        serif: ["'IBM Plex Mono'", "monospace"],
      },
      colors: {
        ink:    "#0a0a0a",
        paper:  "#111111",
        muted:  "#2a2a2a",
        dim:    "#555555",
        ghost:  "#888888",
        light:  "#e8e4dc",
        accent: "#c8b89a",
      },
      animation: {
        "fade-up": "fade-up 0.6s ease forwards",
        "fade-in": "fade-in 0.4s ease forwards",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
