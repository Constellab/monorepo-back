import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { BL_REFRESH_CAPABLE_HEADER } from '../decorators/bl-public.decorator';

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
    const originRegex = domains.map((domain) => new RegExp(`https:\\/\\/.*\\.${domain.replace('.', '\\.')}`));
    const exactOrigin = domains.map((domain) => new RegExp(`https:\\/\\/${domain.replace('.', '\\.')}`));
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
