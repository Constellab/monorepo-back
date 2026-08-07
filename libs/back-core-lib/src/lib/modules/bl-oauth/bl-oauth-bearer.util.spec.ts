import { blExtractBearerToken } from './bl-oauth-bearer.util';

describe('blExtractBearerToken', () => {
  it('extracts the token from a well-formed Bearer header', () => {
    expect(blExtractBearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('is case-insensitive on the scheme', () => {
    expect(blExtractBearerToken('bearer abc')).toBe('abc');
  });

  it('returns null when the Bearer prefix is missing (raw token rejected)', () => {
    // the current Constellab convention passes a raw token, but a Resource Server
    // must require the standard "Bearer " scheme
    expect(blExtractBearerToken('abc.def.ghi')).toBeNull();
  });

  it('returns null for missing or empty headers', () => {
    expect(blExtractBearerToken(undefined)).toBeNull();
    expect(blExtractBearerToken('')).toBeNull();
    expect(blExtractBearerToken('Bearer ')).toBeNull();
  });
});
