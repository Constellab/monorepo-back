import supertest from 'supertest';

import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from './test-credentials';
import { CnTestE2EHelper } from './test-e2e-helper.class';

/** Mirrors CREDENTIAL_THROTTLE in cn-auth.controller.ts. */
const CREDENTIAL_LIMIT = 10;

/** Mirrors the unnamed throttler in cn-app.module.ts. */
const GLOBAL_LIMIT = 60;

/**
 * Rate limiting on the auth endpoints.
 *
 * The only suite that opts back into the throttler (see `CnTestAppOptions`), because it is
 * the only one whose subject IS the throttler — every other suite would otherwise fail on
 * a 429 that has nothing to do with what it asserts.
 *
 * These assertions are about the count actually enforced over HTTP, which is the only
 * place it can be checked: the limit lives in a decorator's argument, and a mock would
 * carry whatever meaning the code already assumes rather than the one the library applies.
 *
 * The counters are in-memory and per route+IP, so each `describe` below shares one bucket
 * with itself and none with the others (the key includes the handler name).
 */
describe('Rate limiting (e2e)', () => {
  const helper = new CnTestE2EHelper('');

  beforeAll(async () => {
    await helper.initAppModule({ throttling: true });
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  describe('POST /auth/login', () => {
    /** Fire `count` logins in sequence and return the status of each. */
    async function loginTimes(count: number): Promise<number[]> {
      const statuses: number[] = [];
      for (let index = 0; index < count; index++) {
        const response = await supertest(helper.app.getHttpServer())
          .post('/auth/login')
          .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD });
        statuses.push(response.status);
      }
      return statuses;
    }

    it(`allows ${CREDENTIAL_LIMIT} attempts per minute and refuses the next`, async () => {
      const statuses = await loginTimes(CREDENTIAL_LIMIT + 1);

      // The point of the tighter limit: this is the brute-force entry point, and it must
      // cut off well below the app-wide ceiling.
      expect(statuses.slice(0, CREDENTIAL_LIMIT)).toEqual(Array(CREDENTIAL_LIMIT).fill(201));
      expect(statuses[CREDENTIAL_LIMIT]).toBe(429);
      expect(CREDENTIAL_LIMIT).toBeLessThan(GLOBAL_LIMIT);
    }, 60_000);
  });

  describe('POST /oauth/token', () => {
    it(`is capped at the app-wide ${GLOBAL_LIMIT}/min`, async () => {
      // The endpoint is unauthenticated and both its grants hit a store, so it must not be
      // uncapped. Asserted because the decorator that caps it lives in the library with the
      // rest of the Authorization Server, and a lost decorator is invisible everywhere
      // else: the endpoint keeps answering, just without a ceiling.
      //
      // This assertion used to live in the Community suite, back when that application was
      // the Authorization Server. It moved here with the endpoint (ADR-0001).
      const statuses: number[] = [];
      for (let index = 0; index < GLOBAL_LIMIT + 1; index++) {
        const response = await supertest(helper.app.getHttpServer())
          .post('/oauth/token')
          .send({ grant_type: 'refresh_token', refresh_token: 'nope', client_id: 'nope' });
        statuses.push(response.status);
      }

      // Every attempt is a rejected grant (400) until the limiter takes over.
      expect(statuses.slice(0, GLOBAL_LIMIT)).toEqual(Array(GLOBAL_LIMIT).fill(400));
      expect(statuses[GLOBAL_LIMIT]).toBe(429);
    }, 60_000);
  });

  describe('POST /auth/refresh', () => {
    it(`sits on the app-wide ${GLOBAL_LIMIT}/min, not the credential limit`, async () => {
      // It is hit on every access-token expiry and the throttler keys on the IP, so the
      // tight limit would throttle legitimate sessions sharing one address. Sending
      // CREDENTIAL_LIMIT + 1 requests must NOT trip it — 401 is the expected answer, since
      // no refresh cookie is presented.
      const statuses: number[] = [];
      for (let index = 0; index < CREDENTIAL_LIMIT + 1; index++) {
        const response = await supertest(helper.app.getHttpServer()).post('/auth/refresh');
        statuses.push(response.status);
      }

      expect(statuses).toEqual(Array(CREDENTIAL_LIMIT + 1).fill(401));
    }, 30_000);
  });
});
