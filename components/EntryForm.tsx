"use client";

import { useState, useCallback } from "react";
import TurnstileWidget from "./TurnstileWidget";
import type { Entry } from "@/types";

interface Props {
  onSuccess: (entry: Entry) => void;
}

export default function EntryForm({ onSuccess }: Props) {
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const hasSiteKey = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const canSubmit =
    message.trim().length > 0 &&
    message.length <= 100 &&
    (!hasSiteKey || !!turnstileToken) &&
    !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          turnstileToken,
        }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const errMsg =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "오류가 발생했습니다.";
        setError(errMsg);
        return;
      }

      onSuccess(data as Entry);
      setMessage("");
      setTurnstileToken(null);
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  return (
    <div className="w-full">
      {/* Textarea */}
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="오늘 느낀 것을 남겨보세요…"
          maxLength={100}
          rows={3}
          className="
            w-full bg-paper border border-muted rounded
            text-light placeholder-dim font-serif text-lg
            py-3 px-4 pr-16 resize-none outline-none
            transition-colors focus:border-accent/60
            leading-relaxed
          "
        />
        <span
          className={[
            "absolute bottom-3 right-4 font-mono text-xs tabular-nums transition-colors",
            message.length > 90 ? "text-amber-500" : "text-dim",
            message.length >= 100 ? "!text-red-500" : "",
          ].join(" ")}
        >
          {message.length}/100
        </span>
      </div>

      {/* Cloudflare Turnstile — 입력창 아래, 제출 버튼 위 */}
      <TurnstileWidget onVerify={handleVerify} onExpire={handleExpire} />

      {error && (
        <p className="mt-3 text-red-400 text-sm font-sans">{error}</p>
      )}

      {/* Actions */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-dim text-xs font-sans">
          Enter 키로도 전송할 수 있어요
        </p>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="
            px-6 py-2.5 text-sm font-sans tracking-widest uppercase
            border border-accent/40 text-accent
            disabled:opacity-30 disabled:cursor-not-allowed
            hover:bg-accent hover:text-ink active:scale-95
            transition-all duration-200
          "
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
          ) : sent ? (
            "✓"
          ) : (
            "남기기"
          )}
        </button>
      </div>
    </div>
  );
}
