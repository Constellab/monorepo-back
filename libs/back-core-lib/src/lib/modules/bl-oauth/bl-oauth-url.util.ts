/**
 * Strip any trailing slashes from a URL or path.
 *
 * Shared because both directions of the OAuth URL handling depend on it and have to
 * agree: an issuer written with or without a trailing slash must yield the same
 * discovery document URLs, and `/mcp/community-doc` and `/mcp/community-doc/` must
 * resolve to the same resource — a resource identifier has to byte-match the URL the
 * client calls, and a client is free to add or drop the slash.
 *
 * Returns an empty string for a value that is nothing but slashes.
 */
export function blStripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}
