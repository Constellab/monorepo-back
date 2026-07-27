import { hnVerifyPkce } from './hn-oauth-pkce.util';

// RFC 7636 Appendix B test vector (S256)
const VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

describe('hnVerifyPkce', () => {
  it('accepts the RFC 7636 S256 vector', () => {
    expect(hnVerifyPkce(VERIFIER, CHALLENGE)).toBe(true);
  });

  it('rejects a wrong verifier of valid length', () => {
    // same length (43), different content → different hash
    const wrong = `a${VERIFIER.slice(1)}`;
    expect(hnVerifyPkce(wrong, CHALLENGE)).toBe(false);
  });

  it('rejects a verifier shorter than 43 chars', () => {
    expect(hnVerifyPkce('too-short', CHALLENGE)).toBe(false);
  });

  it('rejects a verifier longer than 128 chars', () => {
    expect(hnVerifyPkce('a'.repeat(129), CHALLENGE)).toBe(false);
  });

  it('does not fall back to plain (challenge === verifier is not a match)', () => {
    expect(hnVerifyPkce(VERIFIER, VERIFIER)).toBe(false);
  });
});
