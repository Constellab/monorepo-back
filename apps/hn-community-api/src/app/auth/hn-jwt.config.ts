/**
 * Lifetime kept as the module-wide default for `BlJwtModule`, i.e. the duration a
 * token gets when no explicit override is passed to `BlJwtService.generateToken()`.
 *
 * Only `cli-auth` still relies on it. Login, 2FA and the OAuth/MCP token endpoint
 * all pass their own (much shorter) duration, so these 7 days are the last
 * remaining long-lived token in the app — tracked in TECHNICAL_DEBT.md.
 *
 * TODO: remove this once `cli-auth` uses the new refresh token flow.
 */
const legacyTokenDurationInSeconds = 60 * 60 * 24 * 7; // 7 days

/**
 * Defaults for the session token pair.
 */
const defaultAccessTokenDurationInSeconds = 60 * 15; // 15 minutes
const defaultRefreshTokenDurationInSeconds = 60 * 60 * 24 * 30; // 30 days

/**
 * Default for the mcp access token.
 */
const defaultMcpAccessTokenDurationInSeconds = 60 * 60; // 1 hour

export const HN_JWT_CONFIG = {
  legacyTokenDurationInSeconds,
  defaultAccessTokenDurationInSeconds,
  defaultRefreshTokenDurationInSeconds,
  defaultMcpAccessTokenDurationInSeconds,
  authorizationCookie: 'Authorization',
  refreshCookie: 'Refresh_Token',
  refreshCookiePath: '/auth',
};
