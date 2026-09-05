import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
  }

  const limit = rateLimit(`deepgram:${user.id}`, 30, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan token" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    console.error("DEEPGRAM_API_KEY tidak ditemukan di .env.local");
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY tidak diatur" },
      { status: 500 },
    );
  }

  let grantResponse: Response;
  try {
    grantResponse = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      // Beri ruang untuk permission prompt, handshake, dan retry jaringan.
      // Token tetap short-lived dan tidak pernah dikirim ke server lain selain Deepgram.
      body: JSON.stringify({ ttl_seconds: 120 }),
      cache: "no-store",
    });
  } catch (error: unknown) {
    console.error("Deepgram token request failed", error);
    return NextResponse.json(
      { error: "Layanan rekaman tidak tersedia" },
      { status: 502 },
    );
  }

  if (!grantResponse.ok) {
    console.error("Deepgram menolak permintaan temporary token", grantResponse.status);
    return NextResponse.json(
      { error: "Gagal membuat token rekaman" },
      { status: 502 },
    );
  }

  const grant = (await grantResponse.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!grant.access_token) {
    return NextResponse.json(
      { error: "Token rekaman tidak tersedia" },
      { status: 502 },
    );
  }

  return NextResponse.json(
    {
      token: grant.access_token,
      expiresIn: grant.expires_in,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
