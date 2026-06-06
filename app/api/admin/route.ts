import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function isAuthorized(req: NextRequest): boolean {
  const pw = req.headers.get("x-admin-password");
  return !!pw && pw === process.env.ADMIN_PASSWORD;
}

// ── GET /api/admin ────────────────────────────────────────────────────────────
// 숨김 포함 전체 목록 반환 (관리자 전용)

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from("guestbook_entries")
    .select("id, message, created_at, is_hidden")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── PATCH /api/admin ──────────────────────────────────────────────────────────
// Body: { id: string; is_hidden: boolean }

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: unknown; is_hidden?: unknown };

  try {
    body = (await req.json()) as { id?: unknown; is_hidden?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof body.id !== "string" || typeof body.is_hidden !== "boolean") {
    return NextResponse.json(
      { error: "id(string)와 is_hidden(boolean)이 필요합니다." },
      { status: 400 }
    );
  }

  const db = getSupabaseAdmin();

  const { error } = await db
    .from("guestbook_entries")
    .update({ is_hidden: body.is_hidden })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
