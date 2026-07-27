import { createHash, timingSafeEqual } from 'crypto';

const MIN_VERIFIER_LENGTH = 43;
const MAX_VERIFIER_LENGTH = 128;

/**
 * Verify a PKCE `code_verifier` against a stored `code_challenge` using the S256
 * method (RFC 7636): `challenge === BASE64URL(SHA256(verifier))`, no padding.
 *
 * Constant-time comparison; `plain` is intentionally not supported.
 */
export function hnVerifyPkce(codeVerifier: string, codeChallenge: string): boolean {
  if (
    !codeVerifier ||
    !codeChallenge ||
    codeVerifier.length < MIN_VERIFIER_LENGTH ||
    codeVerifier.length > MAX_VERIFIER_LENGTH
  ) {
    return false;
  }

  const computed = createHash('sha256').update(codeVerifier).digest('base64url');
  const computedBuffer = Buffer.from(computed);
  const challengeBuffer = Buffer.from(codeChallenge);

  if (computedBuffer.length !== challengeBuffer.length) {
    return false;
  }
  return timingSafeEqual(computedBuffer, challengeBuffer);
}
