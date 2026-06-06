"use client";

import type { Entry } from "@/types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "방금";
  if (mins < 60) return `${mins}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function EntryList({ entries }: { entries: Entry[] }) {
  // 글 없으면 아무것도 렌더링하지 않음
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
            {timeAgo(entry.created_at)}
          </time>
        </li>
      ))}
    </ul>
  );
}
