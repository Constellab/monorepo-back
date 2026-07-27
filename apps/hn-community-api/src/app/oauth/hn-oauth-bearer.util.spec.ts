import { hnExtractBearerToken } from './hn-oauth-bearer.util';

describe('hnExtractBearerToken', () => {
  it('extracts the token from a well-formed Bearer header', () => {
    expect(hnExtractBearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('is case-insensitive on the scheme', () => {
    expect(hnExtractBearerToken('bearer abc')).toBe('abc');
  });

  it('returns null when the Bearer prefix is missing (raw token rejected)', () => {
    // the current Constellab convention passes a raw token, but a Resource Server
    // must require the standard "Bearer " scheme
    expect(hnExtractBearerToken('abc.def.ghi')).toBeNull();
  });

  it('returns null for missing or empty headers', () => {
    expect(hnExtractBearerToken(undefined)).toBeNull();
    expect(hnExtractBearerToken('')).toBeNull();
    expect(hnExtractBearerToken('Bearer ')).toBeNull();
  });
});
