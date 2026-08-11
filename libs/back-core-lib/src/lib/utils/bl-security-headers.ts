import { NestExpressApplication } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';

/** One year, the value the two hosts that already send HSTS on this platform use. */
export const BL_HSTS_MAX_AGE_SECONDS = 31_536_000;

/**
 * Response headers every API of this monorepo sends, and the `x-powered-by` it stops sending.
 *
 * Call it from `main.ts` before `listen`.
 *
 * **Why not helmet.** helmet's defaults include `Content-Security-Policy: default-src 'self'`
 * and `Cross-Origin-Resource-Policy: same-origin`, and these APIs serve user photos, space
 * photos and document previews that the front-ends load cross-origin. Adopting the defaults
 * would break those responses to gain headers that mean almost nothing on a JSON API. So the
 * three headers that do mean something here are set explicitly, and a CSP is left to the
 * front-ends' nginx, where a document is actually rendered.
 *
 * @param options.isLocal skips HSTS, which the browser caches for a year against the host it
 * saw it on — `localhost` included, where it would then break every plain-HTTP app on the
 * machine.
 */
export function blApplySecurityHeaders(app: NestExpressApplication, options: { isLocal: boolean }): void {
  // Names the framework to anyone who asks. Free reconnaissance, no purpose. (Audit finding 9.)
  app.disable('x-powered-by');

  app.use((_request: Request, response: Response, next: NextFunction) => {
    if (!options.isLocal) {
      // Without it, the FIRST request of a visitor who types the bare host travels in clear
      // and is interceptable, redirect to HTTPS or not — and on a login form that is
      // credentials. `preload` is deliberately not claimed here: it belongs to a host that
      // has been submitted to the browser list, not to a header. (Audit finding 6.)
      response.setHeader(
        'Strict-Transport-Security',
        `max-age=${BL_HSTS_MAX_AGE_SECONDS}; includeSubDomains`
      );
    }

    // Stops a browser from re-deciding the type of an uploaded file we serve back.
    response.setHeader('X-Content-Type-Options', 'nosniff');

    // The default leaks the full URL — path and query — to any third-party HTTPS origin.
    // Cross-origin requests should carry the origin and nothing more. (Audit finding 8.)
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
  });
}
