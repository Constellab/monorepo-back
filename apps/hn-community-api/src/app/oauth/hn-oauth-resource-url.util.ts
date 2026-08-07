import { HN_OAUTH_PATHS } from './hn-oauth.constants';

const METADATA_PREFIX = `/${HN_OAUTH_PATHS.protectedResourceMetadata}`;

/**
 * Strip trailing slashes so `/mcp/community-doc` and `/mcp/community-doc/` resolve to
 * the same resource. A resource identifier must byte-match the URL the client calls,
 * and a client is free to add or drop the trailing slash.
 */
function normalizePath(path: string): string {
  return path.replace(/\/+$/, '');
}

/**
 * Where a protected resource's metadata document lives (RFC 9728 §3.1).
 *
 * The well-known segment is inserted **between the host and the resource path**, not
 * appended: the document for `https://host/mcp/community-doc` is at
 * `https://host/.well-known/oauth-protected-resource/mcp/community-doc`. That is what
 * lets one host serve one document per resource.
 *
 * `resourcePath` is the resource's path component, with or without a leading slash.
 */
export function hnProtectedResourceMetadataUrl(issuer: string, resourcePath: string): string {
  const path = normalizePath(resourcePath);
  const suffix = path.length === 0 || path.startsWith('/') ? path : `/${path}`;
  return `${normalizePath(issuer)}${METADATA_PREFIX}${suffix}`;
}

/**
 * The inverse: given the path of an incoming metadata request, the path of the resource
 * it is asking about — or null if this is not a metadata request at all.
 *
 * Returns an empty string for the pathless document (`/.well-known/oauth-protected-resource`),
 * which is distinct from null: one means "asking about no particular resource", the
 * other "not this endpoint".
 */
export function hnResourcePathFromMetadataUrl(requestPath: string): string | null {
  const path = normalizePath(requestPath);
  if (path === METADATA_PREFIX) {
    return '';
  }
  if (!path.startsWith(`${METADATA_PREFIX}/`)) {
    return null;
  }
  return path.slice(METADATA_PREFIX.length);
}
