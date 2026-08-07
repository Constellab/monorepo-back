/**
 * Route paths for the (general, resource-agnostic) Constellab OAuth 2.1 server.
 *
 * The two discovery documents MUST live at the host root (no app prefix) so MCP
 * clients can find them; the interactive/token endpoints are namespaced under
 * `oauth/` to avoid clashing with the existing `/auth` and `/cli-auth` routes.
 */
export const HN_OAUTH_PATHS = {
  authorizationServerMetadata: '.well-known/oauth-authorization-server',
  protectedResourceMetadata: '.well-known/oauth-protected-resource',
  authorize: 'oauth/authorize',
  token: 'oauth/token',
  register: 'oauth/register',
  revoke: 'oauth/revoke',
} as const;

/**
 * Bounds on a registration request. `/oauth/register` is public and the body limit is
 * 50 MB, so without these an attacker could register a client carrying megabytes of
 * loopback URIs (which always pass the policy) and have them kept in the client store
 * — memory exhaustion — or get the whole payload echoed back in the error body.
 *
 * `maxRejectedUrisReported` keeps the error description useful for diagnosing a real
 * client without turning it into an amplifier.
 */
export const HN_OAUTH_LIMITS = {
  maxRedirectUris: 10,
  maxRedirectUriLength: 2048,
  maxClientNameLength: 200,
  maxRejectedUrisReported: 3,
} as const;
