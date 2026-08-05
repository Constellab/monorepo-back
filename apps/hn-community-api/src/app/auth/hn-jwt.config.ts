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

  /**
   * Marks "a session probably exists", for the server-side renderer only.
   *
   * The renderer receives the browser's cookies but cannot use either token: the
   * `Authorization` one it sees is expired past 15 minutes and it cannot validate it
   * without calling the API, and `Refresh_Token` never reaches it at all
   * (`Path=/auth`). Nor can it refresh on its own — the renewed `Set-Cookie` would
   * never reach the browser. Without this marker every server-rendered page comes out
   * logged out past 15 minutes, for a session that is valid for 30 days.
   *
   * Deliberately `httpOnly` like the other two: no browser JS reads it, only the
   * renderer, and `httpOnly` cookies do reach the renderer.
   *
   * Its lifetime matches the refresh token's and it is re-set on every rotation, so
   * "marker absent" reliably means "no session left to resume". Only its EXISTENCE is
   * ever meaningful — the value is a constant `1`. Never put a timestamp, an id or
   * anything actionable in it: it is unauthenticated, forgeable input, and a value that
   * looks useful invites treating it as an authorization decision.
   */
  sessionMarkerCookie: 'Session_Active',
  sessionMarkerValue: '1',
};
