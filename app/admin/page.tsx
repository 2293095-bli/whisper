"use client";

import { useState, useCallback } from "react";
import type { AdminEntry } from "@/types";

function timeStr(dateStr: string) {
  return new Date(dateStr).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchEntries = useCallback(async (pw: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        headers: { "x-admin-password": pw },
      });
      if (res.status === 401) {
        setError("비밀번호가 올바르지 않습니다.");
        return;
      }
      const data: unknown = await res.json();
      if (!Array.isArray(data)) throw new Error("Unexpected response");
      setEntries(data as AdminEntry[]);
      setAuthed(true);
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEntries(password);
  };

  const toggleHidden = async (entry: AdminEntry) => {
    setUpdating(entry.id);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ id: entry.id, is_hidden: !entry.is_hidden }),
      });
      if (!res.ok) throw new Error("Failed");
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id ? { ...e, is_hidden: !entry.is_hidden } : e
        )
      );
    } catch {
      alert("업데이트에 실패했습니다.");
    } finally {
      setUpdating(null);
    }
  };

  const visible = entries.filter((e) => !e.is_hidden).length;
  const hidden = entries.filter((e) => e.is_hidden).length;

  /* ── 로그인 화면 ── */
  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div
          className="w-full max-w-xs animate-fade-up"
          style={{ opacity: 0 }}
        >
          <p className="font-mono text-xs text-dim tracking-widest uppercase mb-8 text-center">
            Admin
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoFocus
              className="w-full bg-transparent border-b border-muted text-light placeholder-dim font-sans text-sm py-3 outline-none focus:border-accent transition-colors"
            />
            {error && (
              <p className="text-red-400 text-sm font-sans">{error}</p>
            )}
            <button
              type="submit"
              disabled={!password || loading}
              className="w-full py-3 text-sm font-sans tracking-widest uppercase border border-accent/40 text-accent hover:bg-accent hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? "확인 중…" : "입장"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  /* ── 관리 화면 ── */
  return (
    <main className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <div className="flex items-baseline justify-between mb-10">
        <div>
          <p className="font-mono text-xs text-dim tracking-widest uppercase mb-1">
            Admin
          </p>
          <h1 className="font-serif text-2xl text-light font-light">
            방명록 관리
          </h1>
        </div>
        <div className="text-right font-mono text-xs text-dim space-y-0.5">
          <p>공개 {visible}개</p>
          <p>숨김 {hidden}개</p>
        </div>
      </div>

      <div className="divide-y divide-[#191919]">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`py-5 flex items-start gap-4 transition-opacity ${
              entry.is_hidden ? "opacity-30" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <p
                className={`font-serif text-base leading-relaxed break-words ${
                  entry.is_hidden ? "line-through text-ghost" : "text-light"
                }`}
              >
                {entry.message}
              </p>
              <time className="mt-1 block font-mono text-xs text-dim">
                {timeStr(entry.created_at)}
              </time>
            </div>
            <button
              onClick={() => toggleHidden(entry)}
              disabled={updating === entry.id}
              className={`shrink-0 px-3 py-1.5 text-xs font-mono tracking-wide border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                entry.is_hidden
                  ? "border-accent/30 text-accent hover:bg-accent hover:text-ink"
                  : "border-dim/50 text-dim hover:border-red-500/50 hover:text-red-400"
              }`}
            >
              {updating === entry.id ? "…" : entry.is_hidden ? "공개" : "숨김"}
            </button>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="text-dim text-center font-serif italic py-16">
          항목이 없습니다
        </p>
      )}

      <div className="mt-16 text-center">
        <a
          href="/"
          className="font-mono text-xs text-dim hover:text-accent transition-colors tracking-widest uppercase"
        >
          ← 메인으로
        </a>
      </div>
    </main>
  );
}
