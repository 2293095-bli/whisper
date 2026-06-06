"use client";

import { useState, useEffect, useCallback } from "react";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import type { Entry } from "@/types";

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/entries");
      if (!res.ok) return;
      const data: unknown = await res.json();
      if (Array.isArray(data)) setEntries(data as Entry[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSuccess = (entry: Entry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="px-6 pt-16 pb-10 max-w-lg mx-auto w-full animate-fade-in">
        <span className="font-mono text-xs text-dim tracking-[0.3em]">
          {todayLabel}
        </span>
        {/* 제목: 작은 크기, 모노 폰트, 얇게 */}
        <h1 className="mt-3 font-mono text-base text-light font-light leading-relaxed tracking-wide">
          여러분도 누군가에게 Whisper가 되어주세요
        </h1>
      </header>

      {/* ── Form ── */}
      <section
        className="px-6 pb-14 max-w-lg mx-auto w-full animate-fade-up"
        style={{ animationDelay: "120ms", opacity: 0 }}
      >
        <EntryForm onSuccess={handleSuccess} />
      </section>

      {/* ── Divider ── */}
      <div className="max-w-lg mx-auto w-full px-6">
        <div className="border-t border-muted/60 relative">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-ink px-3 font-mono text-xs text-dim tracking-widest">
            ∙∙∙
          </span>
        </div>
      </div>

      {/* ── Entries ── */}
      <section
        className="flex-1 px-6 pt-10 pb-24 max-w-lg mx-auto w-full"
        aria-label="방명록 목록"
      >
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="w-5 h-5 border border-dim border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <EntryList entries={entries} />
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="pb-8 text-center">
        <p className="font-mono text-xs text-muted tracking-wider">
          익명으로 남겨집니다
        </p>
      </footer>
    </main>
  );
}
