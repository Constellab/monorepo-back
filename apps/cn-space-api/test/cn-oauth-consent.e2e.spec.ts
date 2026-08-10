import supertest from 'supertest';

import {
  OAUTH_TEST_ACCESS_COOKIE,
  OAUTH_TEST_CODE_VERIFIER,
  OAUTH_TEST_CONSENT_PATH,
  OAUTH_TEST_REDIRECT_URI,
  OAuthTestClient,
} from './oauth-client.helper';
import { TEST_ADMIN_EMAIL } from './test-credentials';
import { CnTestE2EHelper } from './test-e2e-helper.class';

/**
 * The consent step of the OAuth flow against the Space API, over HTTP only.
 *
 * The question this suite answers is "can anything be granted without the user saying so",
 * and every assertion is something a browser or a client can see: a redirect, a status, a
 * description, and whether the next authorization request asks again. Nothing reaches into
 * the pending-authorization store or the Grant table — a suite that did would keep passing
 * after the parameter contract with the front-end broke, which is the failure that matters
 * here, since the page is in another repository.
 *
 * "Grants nothing" is asserted the only way it is observable: the client gets no code, and a
 * second authorization request still goes through the screen. An approval that had been
 * recorded would show up as the screen being skipped.
 *
 * Requires the local MySQL test database and Redis (see TESTING.md); the helper drops and
 * re-creates the database in beforeAll.
 */
describe('OAuth consent (e2e)', () => {
  const helper = new CnTestE2EHelper('');

  let resource: string;

  const server = (): supertest.Agent => supertest(helper.app.getHttpServer());
  const client = new OAuthTestClient(server, () => resource);

  beforeAll(async () => {
    await helper.initAppModule();
    const response = await server().get('/.well-known/oauth-protected-resource').expect(200);
    resource = response.body.resource as string;
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  /** Exchange a code, which is the only proof that a code was worth anything. */
  function exchange(clientId: string, code: string): supertest.Test {
    return server().post('/oauth/token').send({
      grant_type: 'authorization_code',
      code,
      redirect_uri: OAUTH_TEST_REDIRECT_URI,
      client_id: clientId,
      code_verifier: OAUTH_TEST_CODE_VERIFIER,
    });
  }

  /** What `/authorize` answers now: the consent page, or the client's own redirect target. */
  async function authorizeLocation(clientId: string, sessionToken: string): Promise<URL> {
    const redirect = await client.authorize(clientId, sessionToken);
    return new URL(redirect.headers.location);
  }

  /**
   * Answer for the user, asserting what the API did with the answer.
   *
   * The status is asserted here rather than chained onto the request: minting the decision
   * token is itself a call, so what comes back is a finished response.
   */
  async function decide(
    consentId: string,
    decision: 'allow' | 'deny',
    sessionToken: string,
    expectedStatus = 302
  ): Promise<supertest.Response> {
    const response = await client.decide(consentId, decision, sessionToken);
    expect(response.status).toBe(expectedStatus);
    return response;
  }

  describe('reaching the screen', () => {
    it('asks for consent and issues no code', async () => {
      const clientId = await client.registerClient();

      const location = await authorizeLocation(clientId, await client.sessionToken());

      expect(location.pathname).toBe(OAUTH_TEST_CONSENT_PATH);
      expect(location.searchParams.get('consent_id')).toBeTruthy();
      // The whole point: a registered client with a logged-in user used to be enough.
      expect(location.searchParams.get('code')).toBeNull();
    });

    it('parks a distinct request per authorization', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();

      const [first, second] = [
        await client.consentId(clientId, session),
        await client.consentId(clientId, session),
      ];

      // Two connections being set up at once must not answer for one another.
      expect(first).not.toBe(second);
    });
  });

  describe('describing the request', () => {
    it('names the client and every Resource it asks for', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);

      const details = await server()
        .get('/oauth/authorize/consent/details')
        .query({ consent_id: consentId })
        .set('Cookie', client.sessionCookie(session))
        .expect(200);

      // The parameter contract with the consent page, which lives in another repository:
      // these names are what it reads, and nothing about the client is hardcoded there.
      expect(details.body.client_id).toBe(clientId);
      expect(details.body.client_name).toBe('e2e client');
      expect(details.body.client_name_is_verified).toBe(false);
      expect(details.body.user_email).toBe(TEST_ADMIN_EMAIL);
      expect(details.body.warning).toEqual(expect.any(String));
      expect(details.body.resources).toEqual([
        { name: expect.any(String), url: resource, description: expect.any(String) },
      ]);
    });

    it('answers 401 without a session, so the page can bounce through login', async () => {
      const clientId = await client.registerClient();
      const consentId = await client.consentId(clientId, await client.sessionToken());

      await server().get('/oauth/authorize/consent/details').query({ consent_id: consentId }).expect(401);
    });

    it('answers 404 for a request that does not exist', async () => {
      const session = await client.sessionToken();

      await server()
        .get('/oauth/authorize/consent/details')
        .query({ consent_id: 'never-issued' })
        .set('Cookie', client.sessionCookie(session))
        .expect(404);
    });

    it('answers 404 once the request has been decided', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);
      await decide(consentId, 'allow', session);

      // The page shows "this request no longer exists" rather than offering a decision on
      // something that cannot be completed.
      await server()
        .get('/oauth/authorize/consent/details')
        .query({ consent_id: consentId })
        .set('Cookie', client.sessionCookie(session))
        .expect(404);
    });

    it('creates nothing, so loading the page and closing it grants nothing', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);

      await server()
        .get('/oauth/authorize/consent/details')
        .query({ consent_id: consentId })
        .set('Cookie', client.sessionCookie(session))
        .expect(200);

      // Asking again still goes through the screen: nothing was approved by looking.
      const location = await authorizeLocation(clientId, session);
      expect(location.pathname).toBe(OAUTH_TEST_CONSENT_PATH);
    });
  });

  describe('approving', () => {
    it('sends the code back to the client, and it exchanges for a token pair', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);

      const redirect = await decide(consentId, 'allow', session);

      const location = new URL(redirect.headers.location);
      expect(`${location.origin}${location.pathname}`).toBe(OAUTH_TEST_REDIRECT_URI);
      expect(location.searchParams.get('state')).toBe('the-state');

      const token = await exchange(clientId, location.searchParams.get('code') ?? '').expect(200);
      expect(token.body.access_token).toBeTruthy();
      expect(token.body.refresh_token).toBeTruthy();
    });

    it('cannot be replayed into a second code', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);
      const consentToken = await client.consentToken(consentId, session);

      await client.decideWithToken(consentId, 'allow', consentToken, session).expect(302);

      // A reload of the decision URL, or a replayed history entry, must not produce a
      // second code — the token is spent and the request is decided.
      await client.decideWithToken(consentId, 'allow', consentToken, session).expect(400);
    });

    it('is not asked again for the same client and Resource', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      await client.authorizationCode(clientId, session);

      const location = await authorizeLocation(clientId, session);

      // The user answered this exact question; asking again trains them to click through the
      // screen. It is also how a client obtains a second Grant out of one approval.
      expect(`${location.origin}${location.pathname}`).toBe(OAUTH_TEST_REDIRECT_URI);
      const code = location.searchParams.get('code');
      expect(code).toBeTruthy();
      await exchange(clientId, code ?? '').expect(200);
    });

    it('approves one client, not every client', async () => {
      const session = await client.sessionToken();
      const approved = await client.registerClient();
      await client.authorizationCode(approved, session);

      const other = await client.registerClient();
      const location = await authorizeLocation(other, session);

      // A Grant belongs to the client it was given to. Otherwise approving one AI client
      // would silently admit the next one to register.
      expect(location.pathname).toBe(OAUTH_TEST_CONSENT_PATH);
    });

    it('does not accumulate a second Grant when the same client is approved again', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      // Twice through the flow for one client, one user and one Resource. The second pass is
      // not asked to approve anything — the approval is already there to be refreshed.
      await client.completeFlowFor(clientId, session);
      const second = await client.completeFlowFor(clientId, session);

      await server()
        .post('/oauth/revoke')
        .send({ token: second.refreshToken, client_id: clientId })
        .expect(200);

      // Ending the Grant once is enough to bring the screen back. With a second row on file
      // the approval would survive its own revocation, and the user would never be asked
      // again — which is exactly what "duplicate Grants" would cost them.
      const location = await authorizeLocation(clientId, session);
      expect(location.pathname).toBe(OAUTH_TEST_CONSENT_PATH);
    });
  });

  describe('refusing', () => {
    it('tells the client, and hands out no code', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);

      const redirect = await decide(consentId, 'deny', session);

      const location = new URL(redirect.headers.location);
      expect(`${location.origin}${location.pathname}`).toBe(OAUTH_TEST_REDIRECT_URI);
      // Told, rather than left waiting on a flow that silently ended.
      expect(location.searchParams.get('error')).toBe('access_denied');
      expect(location.searchParams.get('state')).toBe('the-state');
      expect(location.searchParams.get('code')).toBeNull();
    });

    it('grants nothing, so the next request asks again', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      await decide(await client.consentId(clientId, session), 'deny', session);

      const location = await authorizeLocation(clientId, session);
      expect(location.pathname).toBe(OAUTH_TEST_CONSENT_PATH);
    });

    it('is final: the refused request cannot then be approved', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);

      await decide(consentId, 'deny', session);

      // A refusal spends the request exactly as an approval does, so a second navigation
      // cannot turn "no" into "yes".
      await decide(consentId, 'allow', session, 404);
    });
  });

  describe('abandoning', () => {
    it('grants nothing and issues no code', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();

      // The browser reached the screen and closed it: no decision, no minted token.
      await client.consentId(clientId, session);

      const location = await authorizeLocation(clientId, session);
      expect(location.pathname).toBe(OAUTH_TEST_CONSENT_PATH);
      expect(location.searchParams.get('code')).toBeNull();
    });
  });

  describe('the decision cannot be forged', () => {
    it('refuses a decision carrying no minted token', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);

      await server()
        .get('/oauth/authorize/consent/decision')
        .query({ consent_id: consentId, decision: 'allow' })
        .set('Cookie', client.sessionCookie(session))
        .expect(400);

      // Without the token, a page on another origin could make a logged-in visitor's browser
      // approve a pending authorization it started itself, with its own redirect target.
      const location = await authorizeLocation(clientId, session);
      expect(location.pathname).toBe(OAUTH_TEST_CONSENT_PATH);
    });

    it('refuses a made-up token, and leaves the request answerable', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);

      await client.decideWithToken(consentId, 'allow', 'not-a-minted-token', session).expect(400);

      // The user's own request survives a forged attempt, so they can still answer it.
      await decide(consentId, 'allow', session);
    });

    it('refuses a token minted for another pending request', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const target = await client.consentId(clientId, session);
      const other = await client.consentId(clientId, session);

      const otherToken = await client.consentToken(other, session);

      await client.decideWithToken(target, 'allow', otherToken, session).expect(400);
    });

    it('refuses a decision with no session at all', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);
      const consentToken = await client.consentToken(consentId, session);

      await server()
        .get('/oauth/authorize/consent/decision')
        .query({ consent_id: consentId, decision: 'allow', consent_token: consentToken })
        .expect(401);
    });

    it('refuses a decision it cannot read', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);
      const consentToken = await client.consentToken(consentId, session);

      // Neither approving nor refusing: the user pressed one of two buttons, and a third
      // word is a bug rather than an answer.
      await client.decideWithToken(consentId, 'maybe', consentToken, session).expect(400);
    });
  });

  describe('resuming after a login', () => {
    it('sends a user without a session to login, with a URL that comes back here', async () => {
      const clientId = await client.registerClient();
      const consentId = await client.consentId(clientId, await client.sessionToken());

      const redirect = await server()
        .get('/oauth/authorize/consent')
        .query({ consent_id: consentId })
        .expect(302);

      const location = new URL(redirect.headers.location);
      expect(location.pathname).toBe('/login');
      // The front honours a return URL only under the authorization endpoint — that is what
      // keeps its login page from being an open redirect — so this URL has to live there.
      const returnUrl = new URL(location.searchParams.get('returnUrl') ?? '');
      expect(returnUrl.pathname.startsWith('/oauth/authorize')).toBe(true);
      expect(returnUrl.searchParams.get('consent_id')).toBe(consentId);
    });

    it('sends a logged-in user back to the screen', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const consentId = await client.consentId(clientId, session);

      const redirect = await server()
        .get('/oauth/authorize/consent')
        .query({ consent_id: consentId })
        .set('Cookie', client.sessionCookie(session))
        .expect(302);

      const location = new URL(redirect.headers.location);
      expect(location.pathname).toBe(OAUTH_TEST_CONSENT_PATH);
      expect(location.searchParams.get('consent_id')).toBe(consentId);
    });

    it('sends a request that is gone to the page, which is what can explain it', async () => {
      const session = await client.sessionToken();

      const redirect = await server()
        .get('/oauth/authorize/consent')
        .query({ consent_id: 'never-issued' })
        .set('Cookie', client.sessionCookie(session))
        .expect(302);

      // This hop is a browser navigation: answering with an error body would leave a person
      // staring at JSON. The page asks for a description, gets a 404, and says so in words.
      expect(new URL(redirect.headers.location).pathname).toBe(OAUTH_TEST_CONSENT_PATH);
      await server()
        .get('/oauth/authorize/consent/details')
        .query({ consent_id: 'never-issued' })
        .set('Cookie', client.sessionCookie(session))
        .expect(404);
    });

    it('treats an expired Session token as no session, like /authorize does', async () => {
      const clientId = await client.registerClient();
      const consentId = await client.consentId(clientId, await client.sessionToken());

      const redirect = await server()
        .get('/oauth/authorize/consent')
        .query({ consent_id: consentId })
        .set('Cookie', [`${OAUTH_TEST_ACCESS_COOKIE}=not-a-token`])
        .expect(302);

      expect(new URL(redirect.headers.location).pathname).toBe('/login');
    });
  });

  describe('after a revocation', () => {
    it('asks again, so a dismissed client cannot walk back in unseen', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();
      const pair = await client.completeFlowFor(clientId, session);

      await server()
        .post('/oauth/revoke')
        .send({ token: pair.refreshToken, client_id: clientId })
        .expect(200);

      // Revoking ends the Grant as well as the session: without that, the machine the user
      // dismissed would be readmitted with no screen shown.
      const location = await authorizeLocation(clientId, session);
      expect(location.pathname).toBe(OAUTH_TEST_CONSENT_PATH);
    });
  });
});
