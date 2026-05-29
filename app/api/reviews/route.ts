import { NextResponse } from "next/server";
import { getApprovedReviews } from "@/lib/firebase/products";

export async function GET() {
  const reviews = await getApprovedReviews();
  return NextResponse.json({ reviews });
}
