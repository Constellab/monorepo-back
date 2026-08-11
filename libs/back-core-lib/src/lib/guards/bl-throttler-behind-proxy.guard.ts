import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * The throttler guard applied by `@BlPublicSecure()`, keyed on the client address as Express
 * resolves it behind the reverse proxy.
 *
 * **There is no `getTracker` override, and that absence is the point.** It used to return
 * `req.ips.length ? req.ips[0] : req.ip`, copied from the NestJS rate-limiting docs — but
 * `req.ips` is the `X-Forwarded-For` list ordered **client-first**, and Express builds it that
 * way whatever `trust proxy` is set to. Entry 0 is therefore a value the caller writes: a
 * different `X-Forwarded-For` on every request put every attempt in a fresh bucket, and the
 * limit never fired. Rotating a header is free, so this defeated the login limit at no cost
 * to an attacker while the headers still reported a limit being enforced.
 *
 * `ThrottlerGuard`'s own default is `req.ip`, which with `trust proxy` set to 1 (both
 * applications do, in their `main.ts`) resolves to the address the single trusted proxy
 * actually observed — a spoofed header gets appended to, not believed. That is the value we
 * want, so the right override is none.
 *
 * The class stays because it is one name for the guard: the decorator applies it and both e2e
 * suites override it to switch throttling off.
 */
@Injectable()
export class BlThrottlerBehindProxyGuard extends ThrottlerGuard {}
