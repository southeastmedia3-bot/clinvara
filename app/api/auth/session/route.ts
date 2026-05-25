import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const session = cookies().get("session")?.value ?? null;

  return NextResponse.json({
    user: session ? { id: session } : null,
  });
}