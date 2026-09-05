/**
 * JWT_SECRET must only ever be read on the server. Keeping the validation in
 * one place prevents individual routes from silently falling back to a weak
 * shared secret.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }

  return secret;
}

export function getJwtSecretKey(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}
