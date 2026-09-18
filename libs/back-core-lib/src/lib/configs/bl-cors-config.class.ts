import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { BL_REFRESH_CAPABLE_HEADER } from '../decorators/bl-public.decorator';

/**
 * Comma-separated list of the domains allowed to call the API cross-origin, e.g.
 * `constellab.space,preconstellab.com`. Each entry allows the domain itself and any of
 * its sub-domains over https (see `blGetCorsConfig`).
 *
 * Supplied at run time rather than compiled in: a dedicated instance is served from its
 * own domain, and there is nothing in the code that could know it.
 */
export const BL_CORS_ALLOWED_DOMAINS_KEY = 'CORS_ALLOWED_DOMAINS';

/**
 * The allowed domains read from the environment, for the bootstrap — CORS is decided
 * before there is an injector to ask a config service.
 *
 * Empty is valid only locally, where every origin is accepted anyway. Anywhere else an
 * empty list would accept nothing but localhost, which looks exactly like the API being
 * down from the browser's side, so it stops the process at startup instead.
 */
export function blGetCorsAllowedDomains(isLocal: boolean): string[] {
  const raw: string = process.env[BL_CORS_ALLOWED_DOMAINS_KEY] ?? '';
  const domains: string[] = raw
    .split(',')
    .map((domain) => domain.trim())
    .filter((domain) => domain.length > 0);

  if (domains.length === 0 && !isLocal) {
    throw new Error(
      `Missing config value for '${BL_CORS_ALLOWED_DOMAINS_KEY}'. ` +
        'Provide the comma-separated domains allowed to call this API, e.g. ' +
        `${BL_CORS_ALLOWED_DOMAINS_KEY}=constellab.space,preconstellab.com`
    );
  }

  return domains;
}

/**
 * Escape a domain so it can be embedded in the origin regex. The domain comes from the
 * environment, so a dot must not stay a "any character" wildcard.
 */
function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function blGetCorsConfig(
  domains: string[],
  isLocal: boolean,
  additionalAllowedHeader: string[] = []
): CorsOptions {
  let origin: (RegExp | string)[];
  if (isLocal) {
    origin = [/^(.*)/];
  } else {
    // convert the domains to regex
    const originRegex = domains.map((domain) => new RegExp(`https:\\/\\/.*\\.${escapeForRegex(domain)}`));
    const exactOrigin = domains.map((domain) => new RegExp(`https:\\/\\/${escapeForRegex(domain)}`));
    origin = [...originRegex, ...exactOrigin, 'http://localhost:4200', 'http://localhost:4000'];
  }

  return {
    origin: origin, // use regex instead of simple '*'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    /**
     * How long a browser may reuse a preflight result, in seconds.
     *
     * Worth setting since `BL_REFRESH_CAPABLE_HEADER` arrived: a custom header makes
     * every cross-origin GET a preflighted request, where they used to be "simple" ones
     * needing no round trip at all. Without this, Chrome caches a preflight for 5
     * seconds, so the app pays an extra OPTIONS on nearly every call.
     *
     * 7200 is Chrome's ceiling — larger values are silently clamped, not honoured.
     */
    maxAge: 7200,
    // header If-None-Match useful for Safari with service workers
    // BL_REFRESH_CAPABLE_HEADER is a custom header, so the browser withholds it until
    // the preflight lists it here — and a missing entry fails the whole request, not
    // just the header (see `BlOptionalAuth`)
    allowedHeaders:
      'Origin,X-Requested-With,Content-Type,Accept,Authorization,authorization,' +
      `X-Forwarded-for,lang,If-None-Match,${BL_REFRESH_CAPABLE_HEADER}` +
      (additionalAllowedHeader.length > 0 ? ',' + additionalAllowedHeader.join(',') : ''),
  };
}
