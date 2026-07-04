"use client";

import { useState, useEffect, useCallback } from "react";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import type { Entry } from "@/types";

const LIMIT = 30;

function getPageNumbers(current: number, hasMore: boolean): (number | "...")[] {
  // 총 페이지를 모르므로 현재 기준으로 앞뒤 2개씩 + 첫 페이지 표시
  const last = hasMore ? current + 1 : current; // 다음이 있으면 최소 current+1
  const pages: (number | "...")[] = [];

  // 항상 1 표시
  pages.push(1);

  const start = Math.max(2, current - 2);
  const end   = Math.min(last, current + 2);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < last) {
    if (end < last - 1) pages.push("...");
    pages.push(last);
  }

  return pages;
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
    try {
      const res  = await fetch(`/api/entries?page=${pageNum}&limit=${LIMIT}`);
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

  const pageNumbers = getPageNumbers(page, hasMore);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 pt-16 pb-10 max-w-lg mx-auto w-full animate-fade-in">
        <span className="font-mono text-xs text-dim tracking-[0.3em]">
          {todayLabel}
        </span>
        <h1 className="mt-3 font-mono text-base text-light font-light leading-relaxed tracking-wide">
          여러분도 누군가에게 Whisper가 되어주세요
        </h1>
      </header>

      <section
        className="px-6 pb-14 max-w-lg mx-auto w-full animate-fade-up"
        style={{ animationDelay: "120ms", opacity: 0 }}
      >
        <EntryForm onSuccess={handleSuccess} />
      </section>

      <div className="max-w-lg mx-auto w-full px-6">
        <div className="border-t border-muted/60 relative">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-ink px-3 font-mono text-xs text-dim tracking-widest">
            ∙∙∙
          </span>
        </div>
      </div>

      <section className="flex-1 px-6 pt-10 pb-16 max-w-lg mx-auto w-full" aria-label="방명록 목록">
        {loading ? (
          <div className="flex justify-center pt-16">
            <div className="w-5 h-5 border border-dim border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <EntryList entries={entries} />

            {/* ── 페이지네이션 ── */}
            <div className="mt-10 flex items-center justify-center gap-1 flex-wrap">
              {/* 이전 */}
              <button
                onClick={() => loadPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 font-mono text-xs border border-muted text-dim hover:border-accent/50 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
              >
                ←
              </button>

              {/* 페이지 번호들 */}
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 font-mono text-xs text-dim">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => loadPage(p as number)}
                    className={`
                      min-w-[32px] px-2 py-1.5 font-mono text-xs border transition-all duration-200
                      ${p === page
                        ? "border-accent/60 text-accent bg-accent/10"
                        : "border-muted text-dim hover:border-accent/50 hover:text-accent"
                      }
                    `}
                  >
                    {p}
                  </button>
                )
              )}

              {/* 다음 */}
              <button
                onClick={() => loadPage(page + 1)}
                disabled={!hasMore}
                className="px-3 py-1.5 font-mono text-xs border border-muted text-dim hover:border-accent/50 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
              >
                →
              </button>
            </div>
          </>
        )}
      </section>

      <footer className="pb-8 text-center">
        <p className="font-mono text-xs text-muted tracking-wider">
          익명으로 남겨집니다
        </p>
      </footer>
    </main>
  );
}
