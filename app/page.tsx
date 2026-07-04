"use client";

import { useState, useEffect, useCallback } from "react";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import type { Entry } from "@/types";

const LIMIT = 30;

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const loadPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries?page=${pageNum}&limit=${LIMIT}`);
      if (!res.ok) { setEntries([]); setHasMore(false); return; }
      const json = await res.json();
      setEntries(Array.isArray(json?.entries) ? json.entries : []);
      setHasMore(json?.hasMore === true);
      setPage(pageNum);
    } catch {
      setEntries([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(1); }, [loadPage]);

  const handleSuccess = useCallback((_entry: Entry) => { loadPage(1); }, [loadPage]);

  return (
    <main className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="px-6 pt-16 pb-10 max-w-lg mx-auto w-full animate-fade-in">
        <span className="font-mono text-xs text-dim tracking-[0.3em]">
          {todayLabel}
        </span>
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
        className="flex-1 px-6 pt-10 pb-16 max-w-lg mx-auto w-full"
        aria-label="방명록 목록"
      >
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="w-5 h-5 border border-dim border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <EntryList entries={entries} />

            {/* ── 페이지네이션 — 항상 렌더링 ── */}
            <div className="mt-10 flex items-center justify-center gap-8">
              <button
                onClick={() => loadPage(page - 1)}
                disabled={page <= 1}
                className="
                  px-4 py-1.5 font-mono text-xs tracking-widest
                  border border-muted text-dim
                  hover:border-accent/50 hover:text-accent
                  disabled:opacity-20 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                ← 이전
              </button>

              <span className="font-mono text-xs text-dim tabular-nums">
                Page {page}
              </span>

              <button
                onClick={() => loadPage(page + 1)}
                disabled={!hasMore}
                className="
                  px-4 py-1.5 font-mono text-xs tracking-widest
                  border border-muted text-dim
                  hover:border-accent/50 hover:text-accent
                  disabled:opacity-20 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                다음 →
              </button>
            </div>
          </>
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
