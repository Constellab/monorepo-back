import { HN_OAUTH_PATHS } from './hn-oauth.constants';

/**
 * OAuth 2.0 Authorization Server Metadata (RFC 8414).
 * Served (host root) at `/.well-known/oauth-authorization-server`.
 */
export interface HnAuthServerMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  registration_endpoint: string;
  response_types_supported: string[];
  grant_types_supported: string[];
  code_challenge_methods_supported: string[];
  token_endpoint_auth_methods_supported: string[];
}

/**
 * OAuth 2.0 Protected Resource Metadata (RFC 9728).
 * Served (host root) at `/.well-known/oauth-protected-resource`; one document per
 * MCP resource (audience).
 */
export interface HnProtectedResourceMetadata {
  resource: string;
  authorization_servers: string[];
  bearer_methods_supported: string[];
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Build the Authorization Server discovery document. `issuer` must equal the base
 * URL that serves the `.well-known` path (RFC 8414 requires the exact match).
 */
export function hnBuildAuthServerMetadata(issuer: string): HnAuthServerMetadata {
  const base = stripTrailingSlash(issuer);
  return {
    issuer: base,
    authorization_endpoint: `${base}/${HN_OAUTH_PATHS.authorize}`,
    token_endpoint: `${base}/${HN_OAUTH_PATHS.token}`,
    registration_endpoint: `${base}/${HN_OAUTH_PATHS.register}`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
  };
}

/**
 * Build the Protected Resource discovery document for a single MCP resource.
 * `resource` is kept verbatim: it must byte-match the URL the client calls.
 */
export function hnBuildProtectedResourceMetadata(
  resource: string,
  issuer: string
): HnProtectedResourceMetadata {
  return {
    resource,
    authorization_servers: [stripTrailingSlash(issuer)],
    bearer_methods_supported: ['header'],
  };
}
