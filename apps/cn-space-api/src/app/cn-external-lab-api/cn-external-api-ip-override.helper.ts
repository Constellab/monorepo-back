import { BlExternalApiHttpOption } from '@monorepo/back-core-lib';
import { Agent as HttpsAgent } from 'https';

/**
 * For on-premise labs reachable only on the client network, redirect the request
 * to a configured private IP while keeping the original hostname for TLS and
 * routing. This is the programmatic equivalent of `curl --resolve host:port:ip`:
 *
 * - the request URL is rewritten so the TCP connection targets the override IP
 *   (the public DNS points to an unreachable internal IP, and Node/axios ignored
 *   the agent `lookup`/`createConnection` hooks in this runtime);
 * - the TLS `servername` (SNI) is forced to the original hostname so the client's
 *   wildcard certificate still validates and the reverse proxy routes correctly;
 * - the `Host` header is set to the original hostname so the target app sees the
 *   expected virtual host;
 * - `proxy` is disabled so axios does not route through any implicit proxy.
 *
 * Returns the URL to actually call (rewritten to the IP when an override is set,
 * unchanged otherwise) and mutates `options` accordingly.
 */
export function cnApplyIpOverride(
  url: string,
  ipOverride: string | undefined,
  options: BlExternalApiHttpOption
): string {
  if (!ipOverride) {
    return url;
  }

  const parsed = new URL(url);
  const hostname = parsed.hostname;
  const hostHeader = parsed.host; // hostname[:port], preserves a non-default port

  // rewrite the URL so the connection targets the override IP, keeping port/path
  parsed.hostname = ipOverride;
  const rewrittenUrl = parsed.toString();

  // keep SNI on the real hostname so the wildcard certificate matches
  options.httpsAgent = new HttpsAgent({ servername: hostname });

  // preserve the original Host header for the reverse proxy / target app
  options.headers = { ...(options.headers ?? {}), Host: hostHeader };

  // never route through an implicit proxy for these on-premise calls
  options.proxy = false;

  return rewrittenUrl;
}
