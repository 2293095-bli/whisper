/**
 * Cloudflare Turnstile 서버 검증.
 * TURNSTILE_SECRET_KEY 가 없으면 로컬 개발로 판단해 true를 반환합니다.
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn("[Turnstile] TURNSTILE_SECRET_KEY 미설정 — 개발 모드로 생략");
    return true;
  }

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    }
  );

  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
