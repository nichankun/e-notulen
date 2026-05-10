import "server-only";
import { jwtVerify } from "jose";

const secret =
  process.env.JWT_SECRET || "rahasia-negara-bapenda-sultra-super-aman-2026";

export const SECRET_KEY = new TextEncoder().encode(secret);

export async function verifyAuthToken(token: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch {
    return null;
  }
}
