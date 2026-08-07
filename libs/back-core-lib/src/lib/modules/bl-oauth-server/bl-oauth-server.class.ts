import { Request } from 'express';

export const BL_OAUTH_SERVER_CONFIG_PROVIDER = Symbol('BL_OAUTH_SERVER_CONFIG');

/**
 * How the authorization endpoint learns which user is at the browser.
 *
 * The one genuinely application-shaped piece of this half, and the reason it is a seam
 * rather than a parameter: a Session token is minted by the application that reads it, on
 * its own secret, under its own cookie name, and only that application can turn one into a
 * user. Everything else here is the protocol, which is the same wherever it is mounted.
 */
export const BL_OAUTH_CURRENT_USER_RESOLVER = Symbol('BL_OAUTH_CURRENT_USER_RESOLVER');

/**
 * The user a Grant belongs to, as this half needs them.
 *
 * Just the two claims that end up in an MCP access token. Narrow on purpose: the
 * authorization endpoint resolves a user once and the token endpoint reads it back out of
 * stored state, so requiring a full user entity would mean carrying one through Redis for
 * columns nothing here reads.
 */
export interface BlOAuthUser {
  id: string;
  email: string;
}

/**
 * Resolves the logged-in user of an authorization request, or null when there is no
 * session — in which case the endpoint sends the browser to the login page.
 *
 * Returning null rather than throwing is the contract: "not logged in" is the ordinary
 * path through `/authorize`, not a failure. A rejected or expired Session token is the
 * same answer as no token at all, since both mean the user has to log in again.
 */
export interface BlOAuthCurrentUserResolver {
  resolveCurrentUser(request: Request): BlOAuthUser | null | Promise<BlOAuthUser | null>;
}

/**
 * What an application supplies to become the Authorization Server.
 *
 * Configuration only. This half is built to be *movable*, not parameterized: it will only
 * ever be mounted by one application, so the values here are the ones a deployment has to
 * state, not the ones that differ between two consumers.
 *
 * The Resources tokens may be minted for are deliberately absent — they belong to the
 * Resource Server half, and are read from `BlResourceRegistry` so the audience written into
 * a token and the audience checked against it come from one list.
 */
export interface BlOAuthServerConfig {
  /**
   * Base URL serving the `.well-known` documents, no trailing slash required.
   *
   * RFC 8414 requires the `issuer` in the discovery document to equal the URL the document
   * was fetched from, so this is not free-form: it is the host clients record at
   * registration and cannot be changed without invalidating what they hold.
   */
  issuer: string;

  /**
   * Front-end login page `/authorize` redirects to when there is no active session.
   *
   * The front must honour a `returnUrl` parameter and come back to it after login —
   * a cross-repository dependency, and the reason a logged-out authorization request works
   * at all.
   *
   * Used verbatim, with only `?returnUrl=` appended. Unlike {@link issuer} this is a full
   * page URL rather than a base, so nothing here normalizes it: a trailing slash names a
   * different page, and silently removing one would send users somewhere the front does not
   * serve.
   */
  frontLoginUrl: string;

  /**
   * Non-loopback redirect URIs a client may register, matched exactly.
   *
   * Loopback is always allowed on any port and is not listed here; see
   * `blValidateRedirectUris`.
   */
  allowedRedirectUris: string[];

  /**
   * Lifetime of an MCP access token.
   *
   * Read once per response by both the signature and the `expires_in` the client is told,
   * so they cannot drift: a client trusting a longer `expires_in` than the signature stops
   * refreshing in time and starts failing on 401s it did not expect.
   */
  mcpAccessTokenDurationInSeconds: number;
}
