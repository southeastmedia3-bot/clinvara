import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  return NextResponse.json({ user: getCurrentSession() });
}

export async function DELETE() {
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
