import "server-only";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/database/schema";
import { getJwtSecretKey } from "@/lib/jwt";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function verifyAuthToken(token: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export type AuthenticatedUser = {
  id: string;
  nip: string;
  name: string;
  role: "admin" | "pegawai";
  agency: string | null;
};

/**
 * Resolve the session against the database instead of trusting role claims
 * forever. This also invalidates sessions for deleted users immediately.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  const userId = typeof payload?.id === "string" ? payload.id : "";

  if (!UUID_PATTERN.test(userId)) return null;

  const [user] = await db
    .select({
      id: users.id,
      nip: users.nip,
      name: users.name,
      role: users.role,
      agency: users.agency,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  return {
    ...user,
    role: user.role ?? "pegawai",
  };
}
