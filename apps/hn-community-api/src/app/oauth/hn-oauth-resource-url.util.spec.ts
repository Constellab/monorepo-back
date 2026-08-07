import { hnProtectedResourceMetadataUrl, hnResourcePathFromMetadataUrl } from './hn-oauth-resource-url.util';

const ISSUER = 'https://api.example.com';
const WELL_KNOWN = '/.well-known/oauth-protected-resource';

describe('hnProtectedResourceMetadataUrl', () => {
  it('inserts the well-known segment before the resource path, not after it', () => {
    // The whole point of RFC 9728 §3.1: this is what lets one host serve one document
    // per resource. Appending would collapse them all onto the same URL.
    expect(hnProtectedResourceMetadataUrl(ISSUER, '/mcp/community-doc')).toBe(
      `${ISSUER}${WELL_KNOWN}/mcp/community-doc`
    );
  });

  it('accepts a path with or without a leading slash', () => {
    expect(hnProtectedResourceMetadataUrl(ISSUER, 'mcp/community-doc')).toBe(
      `${ISSUER}${WELL_KNOWN}/mcp/community-doc`
    );
  });

  it('yields the pathless document for an empty path', () => {
    expect(hnProtectedResourceMetadataUrl(ISSUER, '')).toBe(`${ISSUER}${WELL_KNOWN}`);
  });

  it('does not double a slash from either side', () => {
    expect(hnProtectedResourceMetadataUrl(`${ISSUER}/`, '/mcp/community-doc/')).toBe(
      `${ISSUER}${WELL_KNOWN}/mcp/community-doc`
    );
  });
});

describe('hnResourcePathFromMetadataUrl', () => {
  it('recovers the resource path from a metadata request', () => {
    expect(hnResourcePathFromMetadataUrl(`${WELL_KNOWN}/mcp/community-doc`)).toBe('/mcp/community-doc');
  });

  it('round-trips with hnProtectedResourceMetadataUrl', () => {
    const path = '/mcp/community-doc';
    const url = hnProtectedResourceMetadataUrl(ISSUER, path);
    expect(hnResourcePathFromMetadataUrl(url.slice(ISSUER.length))).toBe(path);
  });

  it('distinguishes the pathless document from a non-metadata path', () => {
    // '' means "asking about no particular resource" — the controller answers with the
    // primary one. null means "not this endpoint" and must not be treated as a resource.
    expect(hnResourcePathFromMetadataUrl(WELL_KNOWN)).toBe('');
    expect(hnResourcePathFromMetadataUrl('/mcp/community-doc')).toBeNull();
    expect(hnResourcePathFromMetadataUrl('/.well-known/oauth-authorization-server')).toBeNull();
  });

  it('does not match a path that merely starts with the same characters', () => {
    expect(hnResourcePathFromMetadataUrl(`${WELL_KNOWN}-other`)).toBeNull();
  });

  it('ignores a trailing slash on either form', () => {
    expect(hnResourcePathFromMetadataUrl(`${WELL_KNOWN}/`)).toBe('');
    expect(hnResourcePathFromMetadataUrl(`${WELL_KNOWN}/mcp/community-doc/`)).toBe('/mcp/community-doc');
  });
});
