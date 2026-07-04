"use client";

import type { Entry } from "@/types";

// "2026년 7월 4일 00:39" 형식, 한국 시간(KST) 기준
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function EntryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return null;

  return (
    <ul className="divide-y divide-[#191919]">
      {entries.map((entry, i) => (
        <li
          key={entry.id}
          className="py-6 animate-fade-up"
          style={{
            animationDelay: `${Math.min(i * 40, 400)}ms`,
            opacity: 0,
          }}
        >
          <p className="font-mono text-light text-base leading-relaxed break-words tracking-wide">
            {entry.message}
          </p>
          <time className="mt-2 block font-mono text-xs text-dim tracking-widest">
            {formatDate(entry.created_at)}
          </time>
        </li>
      ))}
    </ul>
  );
}
