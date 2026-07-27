import { hnBuildAuthServerMetadata, hnBuildProtectedResourceMetadata } from './hn-oauth-metadata.builder';

const ISSUER = 'https://api.example.com';
const RESOURCE = 'https://api.example.com/mcp/community-doc';

describe('hnBuildAuthServerMetadata', () => {
  it('exposes the issuer and the three endpoints derived from it', () => {
    const meta = hnBuildAuthServerMetadata(ISSUER);
    expect(meta.issuer).toBe(ISSUER);
    expect(meta.authorization_endpoint).toBe(`${ISSUER}/oauth/authorize`);
    expect(meta.token_endpoint).toBe(`${ISSUER}/oauth/token`);
    expect(meta.registration_endpoint).toBe(`${ISSUER}/oauth/register`);
  });

  it('advertises only the capabilities we actually support', () => {
    const meta = hnBuildAuthServerMetadata(ISSUER);
    expect(meta.response_types_supported).toEqual(['code']);
    expect(meta.grant_types_supported).toEqual(['authorization_code']);
    // S256 only — never advertise `plain`
    expect(meta.code_challenge_methods_supported).toEqual(['S256']);
    // public clients (PKCE), no client secret
    expect(meta.token_endpoint_auth_methods_supported).toEqual(['none']);
  });

  it('normalizes a trailing slash on the issuer so URLs are not doubled', () => {
    const meta = hnBuildAuthServerMetadata(`${ISSUER}/`);
    expect(meta.issuer).toBe(ISSUER);
    expect(meta.authorization_endpoint).toBe(`${ISSUER}/oauth/authorize`);
  });
});

describe('hnBuildProtectedResourceMetadata', () => {
  it('binds the resource to the authorization server', () => {
    const meta = hnBuildProtectedResourceMetadata(RESOURCE, ISSUER);
    expect(meta.resource).toBe(RESOURCE);
    expect(meta.authorization_servers).toEqual([ISSUER]);
    expect(meta.bearer_methods_supported).toEqual(['header']);
  });

  it('keeps the resource identifier byte-for-byte (no trailing-slash mangling)', () => {
    const meta = hnBuildProtectedResourceMetadata(RESOURCE, ISSUER);
    // the resource must match the exact URL the client POSTs to
    expect(meta.resource).toBe(RESOURCE);
  });
});
