/**
 * Redirect URI policy applied at Dynamic Client Registration.
 *
 * `POST /oauth/register` is public (RFC 7591 permits this) and there is no consent
 * screen (yet), so without a policy anyone could register a client pointing at their own
 * domain, send the `/oauth/authorize` link to a logged-in user, and collect an
 * authorization code in their name. Constraining the redirect target removes that
 * exfiltration path while keeping DCR usable by the first-party clients, which need
 * it to connect on their own.
 *
 * Two cases:
 * - **loopback** (`localhost`, `127.0.0.1`, `::1`): always accepted, on any port and
 *   any path. RFC 8252 §7.3 requires port flexibility for native apps, and a code
 *   delivered to the victim's own machine is not reachable by a remote attacker.
 * - **anything else**: must be `https` and match an allowlist entry exactly — same
 *   scheme, host, port, path and query. No wildcards, no subdomain matching.
 */

import { BL_OAUTH_LIMITS } from './bl-oauth.constants';

const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

function parseUri(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isLoopback(url: URL): boolean {
  return LOOPBACK_HOSTNAMES.has(url.hostname);
}

/**
 * Compare on parsed components, never on the raw string.
 */
function matchesAllowlistEntry(url: URL, entry: string): boolean {
  const allowed = parseUri(entry);
  if (allowed == null) {
    return false;
  }
  return (
    url.protocol === allowed.protocol &&
    url.host === allowed.host &&
    url.pathname === allowed.pathname &&
    url.search === allowed.search
  );
}

/**
 * Whether a client may register this redirect URI.
 *
 * @param redirectUri the URI submitted at registration
 * @param allowlist   accepted non-loopback URIs; loopback needs no entry
 */
export function blRedirectUriAllowed(redirectUri: string, allowlist: string[]): boolean {
  const url = parseUri(redirectUri);
  if (url == null) {
    return false;
  }

  // RFC 6749 §3.1.2: the redirection endpoint must not include a fragment.
  if (url.hash !== '') {
    return false;
  }

  if (isLoopback(url)) {
    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  if (url.protocol !== 'https:') {
    return false;
  }

  return allowlist.some((entry) => matchesAllowlistEntry(url, entry));
}

/**
 * Outcome of validating the `redirect_uris` member of a registration request.
 * The validator stays free of HTTP concerns and the controller turns a failure
 * into an OAuth error.
 */
export type BlRedirectUrisValidation =
  { ok: true; redirectUris: string[] } | { ok: false; errorDescription: string };

/**
 * Validate the raw `redirect_uris` value: shape, bounds, then the policy above.
 *
 * Bounds come first, so an oversized payload is rejected with a constant-size message
 * rather than one built from attacker-controlled input.
 */
export function blValidateRedirectUris(value: unknown, allowlist: string[]): BlRedirectUrisValidation {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((uri): uri is string => typeof uri === 'string' && uri.length > 0)
  ) {
    return { ok: false, errorDescription: 'redirect_uris must be a non-empty array of strings' };
  }

  const { maxRedirectUris, maxRedirectUriLength, maxRejectedUrisReported } = BL_OAUTH_LIMITS;

  if (value.length > maxRedirectUris) {
    return { ok: false, errorDescription: `redirect_uris must hold at most ${maxRedirectUris} entries` };
  }

  if (value.some((uri) => uri.length > maxRedirectUriLength)) {
    return {
      ok: false,
      errorDescription: `each redirect_uri must be at most ${maxRedirectUriLength} characters`,
    };
  }

  const rejected = value.filter((uri) => !blRedirectUriAllowed(uri, allowlist));
  if (rejected.length > 0) {
    const reported = rejected.slice(0, maxRejectedUrisReported);
    const hidden = rejected.length - reported.length;
    const suffix = hidden > 0 ? `, and ${hidden} more` : '';
    return { ok: false, errorDescription: `redirect_uri not allowed: ${reported.join(', ')}${suffix}` };
  }

  return { ok: true, redirectUris: value };
}
