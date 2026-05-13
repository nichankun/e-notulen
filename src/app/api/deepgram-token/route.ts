import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    console.error("DEEPGRAM_API_KEY tidak ditemukan di .env.local");
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY tidak diatur" },
      { status: 500 },
    );
  }

  return NextResponse.json({ token: apiKey });
}
