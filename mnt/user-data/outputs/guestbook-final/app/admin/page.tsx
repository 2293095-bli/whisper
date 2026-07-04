"use client";

import { useState, useEffect, useCallback } from "react";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import type { Entry } from "@/types";

const LIMIT = 30;

export default function Home() {
  const [entries,  setEntries]  = useState<Entry[]>([]);
  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(false);
  const [loading,  setLoading]  = useState(true);   // 첫 로딩
  const [loadMore, setLoadMore] = useState(false);  // 더보기 로딩

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // page 가 바뀔 때마다 해당 페이지 fetch
  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      const res = await fetch(`/api/entries?page=${pageNum}&limit=${LIMIT}`);
      if (!res.ok) return;

      const data = (await res.json()) as {
        entries: Entry[];
        hasMore: boolean;
      };

      setEntries((prev) =>
        pageNum === 1 ? data.entries : [...prev, ...data.entries]
      );
      setHasMore(data.hasMore);
    } finally {
      if (pageNum === 1) setLoading(false);
      else               setLoadMore(false);
    }
  }, []);

  // 첫 마운트
  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  // 새 글 작성 성공 → 맨 위에 추가
  const handleSuccess = (entry: Entry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  // 더 보기 클릭
  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    setLoadMore(true);
    fetchPage(next);
  };

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

            {/* ── 더 보기 버튼 ── */}
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadMore}
                  className="
                    px-5 py-2 font-mono text-xs tracking-widest
                    border border-muted text-dim
                    hover:border-accent/50 hover:text-accent
                    disabled:opacity-30 disabled:cursor-not-allowed
                    transition-all duration-200
                  "
                >
                  {loadMore ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      loading
                    </span>
                  ) : (
                    "더 보기"
                  )}
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
