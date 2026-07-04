"use client";

import { useState, useEffect, useCallback } from "react";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import type { Entry } from "@/types";

const LIMIT = 30;

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current <= 4) {
    for (let i = 2; i <= 5; i++) pages.push(i);
    pages.push("...");
  } else if (current >= total - 3) {
    pages.push("...");
    for (let i = total - 4; i <= total - 1; i++) pages.push(i);
  } else {
    pages.push("...");
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push("...");
  }
  pages.push(total);
  return pages;
}

export default function Home() {
  const [entries,    setEntries]    = useState<Entry[]>([]);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);

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
      setTotalPages(typeof json?.totalPages === "number" ? Math.max(1, json.totalPages) : 1);
      setPage(pageNum);
    } catch {
      setEntries([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(1); }, [loadPage]);

  const handleSuccess = useCallback((_entry: Entry) => { loadPage(1); }, [loadPage]);

  const pageNumbers = getPageNumbers(page, totalPages);

  const btnBase = "px-2.5 py-1.5 font-mono text-xs border transition-all duration-200";
  const btnIdle = "border-muted/40 text-dim hover:border-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed";
  const btnActive = "border-white/60 text-white bg-white/10";

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
            <div className="w-5 h-5 border border-dim border-t-white/40 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <EntryList entries={entries} />

            <div className="mt-10 flex items-center justify-center gap-1 flex-wrap">
              {/* 맨 처음 */}
              <button
                onClick={() => loadPage(1)}
                disabled={page <= 1}
                className={`${btnBase} ${btnIdle}`}
              >
                «
              </button>
              {/* 이전 */}
              <button
                onClick={() => loadPage(page - 1)}
                disabled={page <= 1}
                className={`${btnBase} ${btnIdle}`}
              >
                ‹
              </button>

              {/* 번호 */}
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-1.5 font-mono text-xs text-dim select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => loadPage(p as number)}
                    className={`${btnBase} min-w-[32px] ${p === page ? btnActive : btnIdle}`}
                  >
                    {p}
                  </button>
                )
              )}

              {/* 다음 */}
              <button
                onClick={() => loadPage(page + 1)}
                disabled={page >= totalPages}
                className={`${btnBase} ${btnIdle}`}
              >
                ›
              </button>
              {/* 맨 끝 */}
              <button
                onClick={() => loadPage(totalPages)}
                disabled={page >= totalPages}
                className={`${btnBase} ${btnIdle}`}
              >
                »
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
