// 1. WAJIB: Install dulu 'npm install server-only' jika belum ada
import "server-only";
import { jwtVerify } from "jose";

// 2. Gunakan nama variabel yang baru kita ganti di .env
const secret =
  process.env.JWT_SECRET_KEY || "rahasia-negara-bapenda-sultra-super-aman-2026";
export const SECRET_KEY = new TextEncoder().encode(secret);

export async function verifyAuthToken(token: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch {
    // Tanpa (error) agar linter senang
    return null;
  }
}
