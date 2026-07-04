import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyTurnstile } from "@/lib/turnstile";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "30", 10));

    const from = (page - 1) * limit;
    const to   = from + limit; // limit+1개 → hasMore 판별

    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("guestbook_entries")
      .select("id, message, created_at")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ entries: [], hasMore: false }, { status: 500 });
    }

    const rows    = Array.isArray(data) ? data : [];
    const hasMore = rows.length > limit;
    const entries = rows.slice(0, limit);

    return NextResponse.json({ entries, hasMore });
  } catch {
    return NextResponse.json({ entries: [], hasMore: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { message?: unknown; turnstileToken?: unknown };

    const trimmed = (typeof body.message === "string" ? body.message : "").trim();

    if (!trimmed) {
      return NextResponse.json({ error: "메시지를 입력해주세요." }, { status: 400 });
    }
    if (trimmed.length > 100) {
      return NextResponse.json({ error: "100자 이내로 입력해주세요." }, { status: 400 });
    }

    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    const captchaOk = await verifyTurnstile(token);
    if (!captchaOk) {
      return NextResponse.json({ error: "캡차 인증에 실패했습니다." }, { status: 403 });
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
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
}
