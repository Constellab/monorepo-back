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

/**
 * Append query parameters to an already-validated URL.
 *
 * Shared because every hop of the authorization flow that leaves the server ends here —
 * the code going back to the client, the refusal going back to the client, the browser
 * going to the login page and to the consent page — and each of them has to keep whatever
 * query string the base URL already carried. `URL` is what guarantees that; hand-built
 * `?a=b` concatenation is what silently drops it.
 *
 * A `null` or `undefined` value is omitted rather than serialized as the string "null":
 * an OAuth request without `state` must come back without one, not with `state=undefined`.
 */
export function blBuildUrlWithParams(
  base: string,
  params: Record<string, string | undefined | null>
): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}
