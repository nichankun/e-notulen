import { createHmac, timingSafeEqual } from "node:crypto";

import { getJwtSecret } from "@/lib/jwt";

const TOKEN_TTL_SECONDS = 24 * 60 * 60;

type TokenPayload = {
  kind: "meeting" | "attendee";
  meetingId: string;
  attendeeId?: string;
  exp: number;
};

function signPayload(payload: Omit<TokenPayload, "exp">): string {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS }),
  ).toString("base64url");
  const signature = createHmac("sha256", getJwtSecret())
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

function verifyPayload(token: string): TokenPayload | null {
  try {
    const [body, signature] = token.split(".");
    if (!body || !signature) return null;

    const expected = createHmac("sha256", getJwtSecret())
      .update(body)
      .digest("base64url");
    const actualBytes = Buffer.from(signature, "base64url");
    const expectedBytes = Buffer.from(expected, "base64url");

    if (
      actualBytes.length !== expectedBytes.length ||
      !timingSafeEqual(actualBytes, expectedBytes)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as TokenPayload;

    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createMeetingAttendanceToken(meetingId: string): string {
  return signPayload({ kind: "meeting", meetingId });
}

export function verifyMeetingAttendanceToken(
  meetingId: string,
  token: string | null,
): boolean {
  if (!token) return false;
  const payload = verifyPayload(token);
  return payload?.kind === "meeting" && payload.meetingId === meetingId;
}

export function createAttendeeSessionToken(
  meetingId: string,
  attendeeId: string,
): string {
  return signPayload({ kind: "attendee", meetingId, attendeeId });
}

export function verifyAttendeeSessionToken(
  meetingId: string,
  token: string | undefined,
): string | null {
  if (!token) return null;
  const payload = verifyPayload(token);

  if (
    payload?.kind !== "attendee" ||
    payload.meetingId !== meetingId ||
    !payload.attendeeId
  ) {
    return null;
  }

  return payload.attendeeId;
}
