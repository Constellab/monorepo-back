import { BL_OAUTH_PATHS } from './bl-oauth.constants';
import { blStripTrailingSlashes } from './bl-oauth-url.util';

const METADATA_PREFIX = `/${BL_OAUTH_PATHS.protectedResourceMetadata}`;

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
export function blProtectedResourceMetadataUrl(issuer: string, resourcePath: string): string {
  const path = blStripTrailingSlashes(resourcePath);
  const suffix = path.length === 0 || path.startsWith('/') ? path : `/${path}`;
  return `${blStripTrailingSlashes(issuer)}${METADATA_PREFIX}${suffix}`;
}

/**
 * The inverse: given the path of an incoming metadata request, the path of the resource
 * it is asking about — or null if this is not a metadata request at all.
 *
 * Returns an empty string for the pathless document (`/.well-known/oauth-protected-resource`),
 * which is distinct from null: one means "asking about no particular resource", the
 * other "not this endpoint".
 */
export function blResourcePathFromMetadataUrl(requestPath: string): string | null {
  const path = blStripTrailingSlashes(requestPath);
  if (path === METADATA_PREFIX) {
    return '';
  }
  if (!path.startsWith(`${METADATA_PREFIX}/`)) {
    return null;
  }
  return path.slice(METADATA_PREFIX.length);
}
