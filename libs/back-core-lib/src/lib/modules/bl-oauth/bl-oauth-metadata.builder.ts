import { BL_OAUTH_PATHS } from './bl-oauth.constants';
import { blStripTrailingSlashes } from './bl-oauth-url.util';

/**
 * OAuth 2.0 Authorization Server Metadata (RFC 8414).
 * Served (host root) at `/.well-known/oauth-authorization-server`.
 */
export interface BlAuthServerMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  registration_endpoint: string;
  revocation_endpoint: string;
  response_types_supported: string[];
  grant_types_supported: string[];
  code_challenge_methods_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  revocation_endpoint_auth_methods_supported: string[];
}

/**
 * OAuth 2.0 Protected Resource Metadata (RFC 9728).
 * Served (host root) at `/.well-known/oauth-protected-resource`; one document per
 * MCP resource (audience).
 */
export interface BlProtectedResourceMetadata {
  resource: string;
  authorization_servers: string[];
  bearer_methods_supported: string[];
}

/**
 * Build the Authorization Server discovery document. `issuer` must equal the base
 * URL that serves the `.well-known` path (RFC 8414 requires the exact match).
 */
export function blBuildAuthServerMetadata(issuer: string): BlAuthServerMetadata {
  const base = blStripTrailingSlashes(issuer);
  return {
    issuer: base,
    authorization_endpoint: `${base}/${BL_OAUTH_PATHS.authorize}`,
    token_endpoint: `${base}/${BL_OAUTH_PATHS.token}`,
    registration_endpoint: `${base}/${BL_OAUTH_PATHS.register}`,
    revocation_endpoint: `${base}/${BL_OAUTH_PATHS.revoke}`,
    response_types_supported: ['code'],
    // A client that does not see `refresh_token` here has no reason to keep the one
    // /token hands it, and will re-run the whole authorization flow on expiry instead.
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    // Public clients: /revoke authenticates on the token itself, nothing else.
    revocation_endpoint_auth_methods_supported: ['none'],
  };
}

/**
 * Build the Protected Resource discovery document for a single MCP resource.
 * `resource` is kept verbatim: it must byte-match the URL the client calls.
 */
export function blBuildProtectedResourceMetadata(
  resource: string,
  issuer: string
): BlProtectedResourceMetadata {
  return {
    resource,
    authorization_servers: [blStripTrailingSlashes(issuer)],
    bearer_methods_supported: ['header'],
  };
}
