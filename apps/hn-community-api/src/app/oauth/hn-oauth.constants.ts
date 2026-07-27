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
} as const;
