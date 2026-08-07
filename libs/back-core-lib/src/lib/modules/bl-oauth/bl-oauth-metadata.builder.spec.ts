import { blBuildAuthServerMetadata, blBuildProtectedResourceMetadata } from './bl-oauth-metadata.builder';

const ISSUER = 'https://api.example.com';
const RESOURCE = 'https://api.example.com/mcp/community-doc';

describe('blBuildAuthServerMetadata', () => {
  it('exposes the issuer and the four endpoints derived from it', () => {
    const meta = blBuildAuthServerMetadata(ISSUER);
    expect(meta.issuer).toBe(ISSUER);
    expect(meta.authorization_endpoint).toBe(`${ISSUER}/oauth/authorize`);
    expect(meta.token_endpoint).toBe(`${ISSUER}/oauth/token`);
    expect(meta.registration_endpoint).toBe(`${ISSUER}/oauth/register`);
    expect(meta.revocation_endpoint).toBe(`${ISSUER}/oauth/revoke`);
  });

  it('advertises only the capabilities we actually support', () => {
    const meta = blBuildAuthServerMetadata(ISSUER);
    expect(meta.response_types_supported).toEqual(['code']);
    // refresh_token must be listed, or a client discards the refresh token /token
    // returns and re-authorizes on every expiry
    expect(meta.grant_types_supported).toEqual(['authorization_code', 'refresh_token']);
    // S256 only — never advertise `plain`
    expect(meta.code_challenge_methods_supported).toEqual(['S256']);
    // public clients (PKCE), no client secret
    expect(meta.token_endpoint_auth_methods_supported).toEqual(['none']);
    expect(meta.revocation_endpoint_auth_methods_supported).toEqual(['none']);
  });

  it('normalizes a trailing slash on the issuer so URLs are not doubled', () => {
    const meta = blBuildAuthServerMetadata(`${ISSUER}/`);
    expect(meta.issuer).toBe(ISSUER);
    expect(meta.authorization_endpoint).toBe(`${ISSUER}/oauth/authorize`);
  });
});

describe('blBuildProtectedResourceMetadata', () => {
  it('binds the resource to the authorization server', () => {
    const meta = blBuildProtectedResourceMetadata(RESOURCE, ISSUER);
    expect(meta.resource).toBe(RESOURCE);
    expect(meta.authorization_servers).toEqual([ISSUER]);
    expect(meta.bearer_methods_supported).toEqual(['header']);
  });

  it('keeps the resource identifier byte-for-byte (no trailing-slash mangling)', () => {
    const meta = blBuildProtectedResourceMetadata(RESOURCE, ISSUER);
    // the resource must match the exact URL the client POSTs to
    expect(meta.resource).toBe(RESOURCE);
  });
});
