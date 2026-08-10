import { createHash } from 'node:crypto';

import supertest from 'supertest';

import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from './test-credentials';

/** The Session token cookie, as the browser carries it. */
export const OAUTH_TEST_ACCESS_COOKIE = 'Authorization';

/** One of `OAUTH_ALLOWED_REDIRECT_URIS` in cn-test.env. */
export const OAUTH_TEST_REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';

/**
 * A real PKCE pair, so an exchange driven through here goes through the same check a client
 * faces rather than a stub of it.
 */
export const OAUTH_TEST_CODE_VERIFIER = 'v'.repeat(64);
export const OAUTH_TEST_CODE_CHALLENGE = createHash('sha256')
  .update(OAUTH_TEST_CODE_VERIFIER)
  .digest('base64url');

/** Front-end route the API sends a browser to for the user's decision. */
export const OAUTH_TEST_CONSENT_PATH = '/oauth/consent';

/** What a client holds after a completed flow. */
export interface OAuthTestTokenPair {
  clientId: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Drives the OAuth flow over HTTP the way a client does: register, log in, authorize,
 * exchange, renew.
 *
 * Shared by the two OAuth e2e suites, which approach the same endpoints from different
 * angles — one asserts what the token is signed with, the other the protocol around it. A
 * copy that drifts is a suite quietly testing a flow no client runs.
 *
 * Everything here goes through the public HTTP surface. It reaches into no store and no
 * service, which is what lets it keep working when the internals move.
 */
export class OAuthTestClient {
  constructor(
    private readonly server: () => supertest.Agent,
    /**
     * The Resource to request an audience for. Read from a discovery document by the suite
     * rather than rebuilt here: the audience and the URL a client calls have to be the same
     * string, and reading it is how a suite would notice if they stopped being.
     */
    private readonly resource: () => string
  ) {}

  /** The session cookie of a logged-in browser. */
  async sessionToken(): Promise<string> {
    const response = await this.server()
      .post('/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
      .expect(201);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const entry = cookies.find((cookie) => cookie.startsWith(`${OAUTH_TEST_ACCESS_COOKIE}=`)) ?? '';
    return entry.split(';')[0].substring(`${OAUTH_TEST_ACCESS_COOKIE}=`.length);
  }

  /** Register a public client, as an MCP client does on first connection. */
  async registerClient(): Promise<string> {
    const response = await this.server()
      .post('/oauth/register')
      .send({ redirect_uris: [OAUTH_TEST_REDIRECT_URI], client_name: 'e2e client' })
      .expect(201);
    return response.body.client_id as string;
  }

  /** A well-formed authorization request, which a suite can then break one field of. */
  authorizeQuery(clientId: string): Record<string, string> {
    return {
      client_id: clientId,
      redirect_uri: OAUTH_TEST_REDIRECT_URI,
      response_type: 'code',
      code_challenge: OAUTH_TEST_CODE_CHALLENGE,
      code_challenge_method: 'S256',
      resource: this.resource(),
      state: 'the-state',
    };
  }

  /** The session cookie header of a logged-in browser, as every consent call carries it. */
  sessionCookie(sessionToken: string): [string] {
    return [`${OAUTH_TEST_ACCESS_COOKIE}=${sessionToken}`];
  }

  /**
   * Drive `/authorize` as a logged-in browser and return where it sent the browser.
   *
   * Not asserted beyond the redirect, so a suite can look at the consent page it is sent to,
   * or at the code it is sent home with when the client is already approved.
   */
  async authorize(clientId: string, sessionToken: string): Promise<supertest.Response> {
    return this.server()
      .get('/oauth/authorize')
      .query(this.authorizeQuery(clientId))
      .set('Cookie', this.sessionCookie(sessionToken))
      .expect(302);
  }

  /**
   * The pending authorization `/authorize` parked for the user to answer.
   *
   * Read off the redirect to the consent page, which is where the id lives in the real flow —
   * a helper that reached into the store would keep passing after the parameter contract with
   * the front-end broke.
   */
  async consentId(clientId: string, sessionToken: string): Promise<string> {
    const redirect = await this.authorize(clientId, sessionToken);
    const consentId = new URL(redirect.headers.location).searchParams.get('consent_id');
    if (!consentId) {
      // Thrown rather than asserted: this file is not a spec, so it carries no jest globals
      // — `tsconfig.app.json` compiles it along with the rest of the app.
      throw new Error(`/authorize did not ask for consent: ${redirect.headers.location}`);
    }
    return consentId;
  }

  /** Mint the single-use token a decision must carry, as the consent page does on the click. */
  async consentToken(consentId: string, sessionToken: string): Promise<string> {
    const response = await this.server()
      .post('/oauth/authorize/consent/token')
      .send({ consent_id: consentId })
      .set('Cookie', this.sessionCookie(sessionToken))
      .expect(200);
    return response.body.consent_token as string;
  }

  /**
   * Answer for the user: mint a token and navigate to the decision endpoint with it.
   *
   * The answer is returned unasserted, so a suite can expect either the redirect to the
   * client or a refusal. A `Response` rather than a `supertest.Test`, unlike
   * {@link decideWithToken}: minting the token is itself a request, so there is nothing left
   * to chain an `.expect()` onto by the time this returns.
   */
  async decide(
    consentId: string,
    decision: 'allow' | 'deny',
    sessionToken: string
  ): Promise<supertest.Response> {
    const consentToken = await this.consentToken(consentId, sessionToken);
    return this.decideWithToken(consentId, decision, consentToken, sessionToken);
  }

  /** The decision navigation itself, for a suite that wants to break the token it carries. */
  decideWithToken(
    consentId: string,
    decision: string,
    consentToken: string,
    sessionToken: string
  ): supertest.Test {
    return this.server()
      .get('/oauth/authorize/consent/decision')
      .query({ consent_id: consentId, decision, consent_token: consentToken })
      .set('Cookie', this.sessionCookie(sessionToken));
  }

  /**
   * Everything a browser does between `/authorize` and the client getting its code: ask,
   * approve if asked, come back with a code.
   *
   * One session throughout, as a real browser has — logging in again per call would leave a
   * trail of sessions and hide any dependence on the one that started the flow.
   *
   * A client the user has already approved is sent straight home with a code and no screen,
   * so this walks the consent step only when there is one. A suite whose subject IS whether
   * the screen appears asserts on `authorize` directly rather than through here.
   */
  async authorizationCode(clientId: string, sessionToken?: string): Promise<string> {
    const session = sessionToken ?? (await this.sessionToken());
    const authorized = new URL((await this.authorize(clientId, session)).headers.location);

    const withoutConsent = authorized.searchParams.get('code');
    if (withoutConsent) {
      return withoutConsent;
    }

    const consentId = authorized.searchParams.get('consent_id');
    if (!consentId) {
      // Thrown rather than asserted: this file is not a spec, so it carries no jest globals
      // — `tsconfig.app.json` compiles it along with the rest of the app.
      throw new Error(`/authorize neither asked for consent nor issued a code: ${authorized.href}`);
    }

    const redirect = await this.decide(consentId, 'allow', session);

    const code = redirect.status === 302 && new URL(redirect.headers.location).searchParams.get('code');
    if (!code) {
      throw new Error(
        `the approval did not send a code to the client: ${redirect.status} ${redirect.headers.location}`
      );
    }
    return code;
  }

  /** The whole flow a client runs: register, authorize, approve, exchange. */
  async completeAuthorizationFlow(): Promise<OAuthTestTokenPair> {
    return this.completeFlowFor(await this.registerClient());
  }

  /**
   * The same flow for a client that is already registered, optionally on a session the caller
   * already holds — which is what lets a suite run it twice for one client and one user, the
   * case where a second Grant must not appear.
   */
  async completeFlowFor(clientId: string, sessionToken?: string): Promise<OAuthTestTokenPair> {
    const code = await this.authorizationCode(clientId, sessionToken);

    const token = await this.server()
      .post('/oauth/token')
      .send({
        grant_type: 'authorization_code',
        code,
        redirect_uri: OAUTH_TEST_REDIRECT_URI,
        client_id: clientId,
        code_verifier: OAUTH_TEST_CODE_VERIFIER,
      })
      .expect(200);

    return {
      clientId,
      accessToken: token.body.access_token as string,
      refreshToken: token.body.refresh_token as string,
    };
  }

  /** Renew from a refresh token. Not asserted, so a suite can expect either outcome. */
  refresh(pair: { clientId: string; refreshToken: string }): supertest.Test {
    return this.server().post('/oauth/token').send({
      grant_type: 'refresh_token',
      refresh_token: pair.refreshToken,
      client_id: pair.clientId,
    });
  }
}
