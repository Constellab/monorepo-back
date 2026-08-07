// Namespace import, matching test-e2e-helper.class.ts: `esModuleInterop` is off, so a
// default import would compile but be undefined at runtime.
import * as supertest from 'supertest';

import { TEST_ADMIN_EMAIL } from './test-credentials';
import { HnTestE2EHelper } from './test-e2e-helper.class';

/** Mirrors CREDENTIAL_THROTTLE in hn-auth.controller.ts. */
const CREDENTIAL_LIMIT = 10;

/** Mirrors the unnamed throttler in hn-app.module.ts. */
const GLOBAL_LIMIT = 60;

/**
 * Rate limiting on the auth endpoints.
 *
 * The only suite that opts back into the throttler (see `HnTestAppOptions`), because
 * it is the only one whose subject IS the throttler.
 *
 * This exists because the limit was wrong by a factor of 1000 for two years — `ttl: 60`
 * read as milliseconds by @nestjs/throttler >= v5, so 10 requests per 60ms instead of
 * per minute — and nothing failed. A unit test cannot catch that: the bug was in the
 * meaning of a config value, and any mock would have carried the same wrong meaning.
 * These assertions are about the count actually enforced over HTTP.
 *
 * Note the counters are in-memory and per route+IP, so each `describe` below shares one
 * bucket with itself and none with the others (the key includes the handler name).
 */
describe('Rate limiting (e2e)', () => {
  const helper = new HnTestE2EHelper('');

  beforeAll(async () => {
    await helper.initAppModule({ throttling: true });
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  /** Fire `count` logins in sequence and return the status of each. */
  async function loginTimes(count: number): Promise<number[]> {
    const statuses: number[] = [];
    for (let index = 0; index < count; index++) {
      const response = await supertest(helper.app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_ADMIN_EMAIL, password: 'anything' });
      statuses.push(response.status);
    }
    return statuses;
  }

  describe('POST /auth/login', () => {
    it(`allows ${CREDENTIAL_LIMIT} attempts per minute and refuses the next`, async () => {
      const statuses = await loginTimes(CREDENTIAL_LIMIT + 1);

      // The point of the tighter limit: this is the brute-force entry point, and it
      // must cut off well below the app-wide ceiling.
      expect(statuses.slice(0, CREDENTIAL_LIMIT)).toEqual(Array(CREDENTIAL_LIMIT).fill(201));
      expect(statuses[CREDENTIAL_LIMIT]).toBe(429);
      expect(CREDENTIAL_LIMIT).toBeLessThan(GLOBAL_LIMIT);
    }, 30_000);

    // ORDER-DEPENDENT: relies on the test above having tripped the limit. The counter
    // is per route+IP with a one-minute window, so it cannot be reset between tests
    // without reaching into the throttler's storage — whose pending timers would then
    // fire against deleted entries. Sequencing is the cheaper honest option.
    it('keeps refusing once tripped, rather than letting one request through per slot', async () => {
      // blockDuration defaults to ttl, so exceeding the limit blocks for the whole
      // window instead of admitting a request as each old hit expires. Worth pinning:
      // a client that retries immediately stays refused, which is what makes the
      // throttler a deterrent rather than a speed bump.
      const statuses = await loginTimes(3);
      expect(statuses).toEqual([429, 429, 429]);
    }, 30_000);
  });

  describe('POST /auth/refresh', () => {
    it(`sits on the app-wide ${GLOBAL_LIMIT}/min, not the credential limit`, async () => {
      // It carries no credential and is called on every access-token expiry, so the
      // tight limit would throttle legitimate sessions. Sending CREDENTIAL_LIMIT + 1
      // requests must NOT trip it — 401 is the expected answer (no refresh cookie).
      const statuses: number[] = [];
      for (let index = 0; index < CREDENTIAL_LIMIT + 1; index++) {
        const response = await supertest(helper.app.getHttpServer()).post('/auth/refresh');
        statuses.push(response.status);
      }

      expect(statuses).toEqual(Array(CREDENTIAL_LIMIT + 1).fill(401));
    }, 30_000);
  });
});
