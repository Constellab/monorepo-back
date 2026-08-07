/**
 * Route paths for the (general, resource-agnostic) Constellab OAuth 2.1 server.
 *
 * The two discovery documents MUST live at the host root (no app prefix) so MCP
 * clients can find them; the interactive/token endpoints are namespaced under
 * `oauth/` to keep clear of each application's own session-auth routes.
 *
 * Shared, and deliberately kept whole, because two things have to agree byte-for-byte:
 * the routes an application actually serves, and the endpoint URLs its discovery
 * document advertises. Splitting this per application would let the two drift, and a
 * client only ever sees the document — it would follow an advertised URL that 404s.
 */
export const BL_OAUTH_PATHS = {
  authorizationServerMetadata: '.well-known/oauth-authorization-server',
  protectedResourceMetadata: '.well-known/oauth-protected-resource',
  authorize: 'oauth/authorize',
  token: 'oauth/token',
  register: 'oauth/register',
  revoke: 'oauth/revoke',
} as const;

/**
 * Bounds the redirect URI policy enforces on a registration request.
 *
 * `/oauth/register` is public and request bodies are large, so without these an
 * attacker could register a client carrying megabytes of loopback URIs (which always
 * pass the policy) and have them kept in the client store — memory exhaustion — or get
 * the whole payload echoed back in the error body.
 *
 * `maxRejectedUrisReported` keeps the error description useful for diagnosing a real
 * client without turning it into an amplifier.
 *
 * Scoped to what the shared policy itself applies. Bounds on the parts of a
 * registration an application stores on its own — a client name, say — belong with that
 * application, not here.
 */
export const BL_OAUTH_LIMITS = {
  maxRedirectUris: 10,
  maxRedirectUriLength: 2048,
  maxRejectedUrisReported: 3,
} as const;
