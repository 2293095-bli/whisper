"use client";

import { useState, useEffect, useCallback } from "react";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import type { Entry } from "@/types";

const LIMIT = 30;

type PageData = { entries: Entry[]; hasMore: boolean };

async function fetchPageData(pageNum: number): Promise<PageData | null> {
  try {
    const res = await fetch(`/api/entries?page=${pageNum}&limit=${LIMIT}`);
    if (!res.ok) return null;
    return (await res.json()) as PageData;
  } catch {
    return null;
  }
}

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
    const data = await fetchPageData(pageNum);
    if (data) {
      setEntries(data.entries);   // 항상 교체
      setHasMore(data.hasMore);
      setPage(pageNum);
    }
    setLoading(false);
  }, []);

  // 첫 마운트
  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  // 새 글 작성 성공 → 1페이지로 리셋
  const handleSuccess = useCallback(async (_entry: Entry) => {
    await loadPage(1);
  }, [loadPage]);

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

            {/* ── 이전 / 페이지 번호 / 다음 ── */}
            {(page > 1 || hasMore) && (
              <div className="mt-10 flex items-center justify-center gap-6">
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
                  {page}
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
            )}
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
