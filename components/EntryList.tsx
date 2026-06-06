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
  if (entries.length === 0) {
    return (
      <p className="text-dim text-center font-serif italic text-lg py-16 animate-fade-in">
        아직 남겨진 말이 없어요
      </p>
    );
  }

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
          <p className="font-serif text-light text-lg leading-relaxed break-words">
            {entry.message}
          </p>
          <time className="mt-2 block font-mono text-xs text-dim tracking-wide">
            {timeAgo(entry.created_at)}
          </time>
        </li>
      ))}
    </ul>
  );
}
