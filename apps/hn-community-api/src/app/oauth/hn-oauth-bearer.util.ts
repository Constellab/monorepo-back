/**
 * Extract the token from an `Authorization: Bearer <token>` header value.
 *
 * A Resource Server requires the standard `Bearer` scheme (case-insensitive) —
 * unlike the rest of the Constellab API, which historically accepts a raw token.
 * Returns null when the header is absent, empty, or not a non-empty Bearer token.
 */
export function hnExtractBearerToken(headerValue: string | undefined | null): string | null {
  if (!headerValue) {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(headerValue.trim());
  const token = match?.[1]?.trim();
  return token ? token : null;
}
