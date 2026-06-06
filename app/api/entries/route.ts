import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyTurnstile } from "@/lib/turnstile";

// ── GET /api/entries ──────────────────────────────────────────────────────────
// is_hidden=false 인 글만 최신순 200개 반환

export async function GET() {
  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from("guestbook_entries")
    .select("id, message, created_at")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── POST /api/entries ─────────────────────────────────────────────────────────
// Body: { message: string; turnstileToken?: string }

export async function POST(req: NextRequest) {
  let body: { message?: unknown; turnstileToken?: unknown };

  try {
    body = (await req.json()) as {
      message?: unknown;
      turnstileToken?: unknown;
    };
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const trimmed = (
    typeof body.message === "string" ? body.message : ""
  ).trim();

  if (!trimmed) {
    return NextResponse.json(
      { error: "메시지를 입력해주세요." },
      { status: 400 }
    );
  }
  if (trimmed.length > 100) {
    return NextResponse.json(
      { error: "100자 이내로 입력해주세요." },
      { status: 400 }
    );
  }

  const token =
    typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  const captchaOk = await verifyTurnstile(token);
  if (!captchaOk) {
    return NextResponse.json(
      { error: "캡차 인증에 실패했습니다." },
      { status: 403 }
    );
  }

  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from("guestbook_entries")
    .insert({ message: trimmed })
    .select("id, message, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
