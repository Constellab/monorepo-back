/**
 * Defaults for the session token pair.
 *
 * Both are overridable per environment — see
 * `CnCoreConfigService.getAccessTokenDurationInSeconds` — so a lifetime can be tuned
 * without a release. These values are what applies when the environment says nothing.
 *
 * The access token is short because it is not stored anywhere: nothing can revoke one
 * in flight, so its lifetime IS its exposure. The refresh token is what carries the
 * session, and it is a row, so it can be revoked.
 */
const defaultAccessTokenDurationInSeconds: number = 60 * 15; // 15 minutes
const defaultRefreshTokenDurationInSeconds: number = 60 * 60 * 24 * 30; // 30 days

/**
 * Lifetime of an MCP access token, which is a machine client's credential rather than a
 * browser's.
 *
 * Longer than a Session token because nothing can revoke one in flight either way, and a
 * machine client renews without a user present: `/oauth/revoke` ends the Grant behind it,
 * so this value is how long a revoked client keeps working, not how long it keeps access.
 */
const defaultMcpAccessTokenDurationInSeconds: number = 60 * 60; // 1 hour

export const CN_JWT_CONFIG = {
  defaultAccessTokenDurationInSeconds,
  defaultRefreshTokenDurationInSeconds,
  defaultMcpAccessTokenDurationInSeconds,
  authorizationCookie: 'Authorization', // name of the authorization cookie
  refreshCookie: 'Refresh_Token', // name of the refresh token cookie
  /**
   * The refresh cookie is narrowed to the routes that exchange it, so this long-lived
   * credential is not sent on every API call. `/auth/refresh` and `/auth/logout` are
   * both under it.
   */
  refreshCookiePath: '/auth',

  /**
   * Name of the marker cookie the FRONT writes for itself, listed here only so both
   * ends of the contract are visible from one place.
   *
   * The API never sets it and never reads it: it is not httpOnly, it carries no
   * credential, and it only ever answers "this visitor may have a session" to spare a
   * pointless call on the login page. Its lifetime tracks the session rather than the
   * access token — a marker expiring with the access token would send a user holding a
   * valid session back to login minutes after logging in.
   */
  authExpiration: 'Auth_Expiration',
};
