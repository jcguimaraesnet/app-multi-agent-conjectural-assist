import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      return NextResponse.json({ status: "ok" });
    }
    return NextResponse.json({ status: "down" }, { status: 503 });
  } catch {
    return NextResponse.json({ status: "down" }, { status: 503 });
  }
}
