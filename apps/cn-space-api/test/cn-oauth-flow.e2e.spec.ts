import supertest from 'supertest';

import {
  OAUTH_TEST_ACCESS_COOKIE,
  OAUTH_TEST_CODE_VERIFIER,
  OAUTH_TEST_CONSENT_PATH,
  OAUTH_TEST_REDIRECT_URI,
  OAuthTestClient,
} from './oauth-client.helper';
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from './test-credentials';
import { CnTestE2EHelper } from './test-e2e-helper.class';

/** Allowlisted, but never the URI a client registers here — so it is refused as unregistered. */
const OTHER_ALLOWLISTED_URI = 'https://claude.com/api/mcp/auth_callback';

/**
 * The Community API, as `COMMUNITY_API_URL` in cn-test.env names it, and its MCP Resource.
 *
 * Written out rather than read from a discovery document, because this application publishes
 * none for it — it serves nothing there. In a deployment the same string is assembled from
 * `COMMUNITY_API_URL` and has to byte-match what the Community publishes as its own Resource
 * identifier; that coupling spans two applications and no suite can check it.
 */
const COMMUNITY_API_URL = 'http://localhost:3333';
const COMMUNITY_RESOURCE = `${COMMUNITY_API_URL}/mcp/community-doc`;

/** The `aud` of an access token, read without verifying it. */
function tokenAudience(accessToken: string): string | undefined {
  const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString());
  return payload.aud as string | undefined;
}

/**
 * The OAuth flow against the Space API, end to end and over HTTP only: registration and its
 * redirect policy, `/authorize` logged out and logged in, the code exchange, rotation,
 * replay and revocation.
 *
 * This application is the single Authorization Server (ADR-0001), and this suite is what
 * says a client can complete a flow against it. Its complements are
 * `cn-oauth-signing.e2e.spec.ts`, which covers what the token is signed with, and
 * `cn-oauth-consent.e2e.spec.ts`, which covers the approval the flow now goes through.
 *
 * Nothing reaches into a store or a service. That is not incidental — the codes, the
 * registrations and the refresh token rows are all internals of `bl-oauth-server`, and a
 * suite asserting on them would break on the next refactor while telling a client nothing.
 *
 * Requires the local MySQL test database and Redis (see TESTING.md); the helper drops and
 * re-creates the database in beforeAll.
 */
describe('OAuth flow (e2e)', () => {
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

  describe('the authorization server discovery document', () => {
    it('names endpoints that all resolve on this host', async () => {
      const metadata = await server().get('/.well-known/oauth-authorization-server').expect(200);

      // RFC 8414 requires the issuer to equal the URL the document was fetched from; a
      // client records it at registration, so a mismatch is not recoverable.
      const issuer = metadata.body.issuer as string;
      expect(issuer.endsWith('/')).toBe(false);

      // Probed with the method each endpoint actually serves, since an unmatched method is
      // itself a 404 — and what is being checked is that the advertised path is served at
      // all, not what it answers to an empty request.
      const endpoints: [string, 'get' | 'post'][] = [
        ['authorization_endpoint', 'get'],
        ['token_endpoint', 'post'],
        ['registration_endpoint', 'post'],
        ['revocation_endpoint', 'post'],
      ];
      for (const [endpoint, method] of endpoints) {
        const advertised = metadata.body[endpoint] as string;
        expect(advertised.startsWith(`${issuer}/`)).toBe(true);

        // Advertised and served must agree byte-for-byte: a client only ever sees the
        // document, so an endpoint that 404s ends the flow there.
        const response = await server()[method](new URL(advertised).pathname).send({});
        expect(response.status).not.toBe(404);
      }
    });

    it('advertises exactly the grants and PKCE method the server implements', async () => {
      const metadata = await server().get('/.well-known/oauth-authorization-server').expect(200);

      expect(metadata.body.grant_types_supported).toEqual(['authorization_code', 'refresh_token']);
      expect(metadata.body.code_challenge_methods_supported).toEqual(['S256']);
    });
  });

  describe('dynamic client registration', () => {
    it('registers a client against an allowlisted redirect target', async () => {
      const response = await server()
        .post('/oauth/register')
        .send({ redirect_uris: [OAUTH_TEST_REDIRECT_URI] })
        .expect(201);

      expect(response.body.client_id).toBeTruthy();
      expect(response.body.redirect_uris).toEqual([OAUTH_TEST_REDIRECT_URI]);
      expect(response.body.token_endpoint_auth_method).toBe('none');
      // A client that does not see `refresh_token` here re-runs the whole flow on expiry.
      expect(response.body.grant_types).toContain('refresh_token');
    });

    it('registers loopback on an arbitrary port, which is what the CLI needs', async () => {
      await server()
        .post('/oauth/register')
        .send({ redirect_uris: ['http://127.0.0.1:49731/callback'] })
        .expect(201);
    });

    it('refuses a redirect target that is neither loopback nor allowlisted', async () => {
      const response = await server()
        .post('/oauth/register')
        .send({ redirect_uris: ['https://evil.example/callback'] })
        .expect(400);

      // Registration is open, so this policy is the only thing stopping anyone from
      // collecting an authorization code for a logged-in user.
      expect(response.body.error).toBe('invalid_redirect_uri');
    });
  });

  describe('the authorization endpoint', () => {
    it('sends a logged-out user to the front login carrying the request to return to', async () => {
      const clientId = await client.registerClient();

      const redirect = await server()
        .get('/oauth/authorize')
        .query(client.authorizeQuery(clientId))
        .expect(302);

      const location = new URL(redirect.headers.location);
      expect(location.pathname).toBe('/login');
      // Without a returnUrl the user logs in and lands somewhere unrelated, and the client
      // never receives a code — the flow ends silently. The front honouring it is a
      // cross-repository dependency, and the reason a logged-out request works at all.
      const returnUrl = location.searchParams.get('returnUrl');
      expect(returnUrl).toContain('/oauth/authorize');
      expect(returnUrl).toContain(`client_id=${clientId}`);
    });

    it('sends a logged-in user to the consent screen rather than handing out a code', async () => {
      const clientId = await client.registerClient();

      const redirect = await client.authorize(clientId, await client.sessionToken());

      // An active session is not an approval. What happens from here is
      // `cn-oauth-consent.e2e.spec.ts`.
      const location = new URL(redirect.headers.location);
      expect(location.pathname).toBe(OAUTH_TEST_CONSENT_PATH);
      expect(location.searchParams.get('consent_id')).toBeTruthy();
      expect(location.searchParams.get('code')).toBeNull();
    });

    it('redirects back to the client with a code and the state once approved', async () => {
      const clientId = await client.registerClient();
      const session = await client.sessionToken();

      const redirect = await client.decide(await client.consentId(clientId, session), 'allow', session);

      expect(redirect.status).toBe(302);
      const location = new URL(redirect.headers.location);
      expect(`${location.origin}${location.pathname}`).toBe(OAUTH_TEST_REDIRECT_URI);
      expect(location.searchParams.get('code')).toBeTruthy();
      expect(location.searchParams.get('state')).toBe('the-state');
    });

    it('is reachable with the session cookie a login actually sets', async () => {
      const login = await server()
        .post('/auth/login')
        .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
        .expect(201);

      // A machine client sends the browser here from its own origin, so the request
      // arrives cross-site. `SameSite=Strict` withholds the cookie on exactly that hop,
      // and every logged-in user would be bounced to the login page — the test above
      // cannot see it, because it sets the cookie by hand.
      expect(setCookieEntry(login, OAUTH_TEST_ACCESS_COOKIE)).toContain('SameSite=Lax');
    });

    it('treats an expired or forged Session token as no session at all', async () => {
      const clientId = await client.registerClient();

      const redirect = await server()
        .get('/oauth/authorize')
        .query(client.authorizeQuery(clientId))
        .set('Cookie', [`${OAUTH_TEST_ACCESS_COOKIE}=not-a-token`])
        .expect(302);

      // The user has to log in again either way, so a rejected token sends them to the
      // login page rather than ending the flow with an error they cannot act on.
      expect(new URL(redirect.headers.location).pathname).toBe('/login');
    });

    it('refuses an unknown client_id without redirecting anywhere', async () => {
      const response = await server()
        .get('/oauth/authorize')
        .query(client.authorizeQuery('not-a-registered-client'))
        .expect(400);

      // Redirecting here would be an open redirect: neither the client nor the target has
      // been validated yet.
      expect(response.body.error).toBe('invalid_client');
      expect(response.headers.location).toBeUndefined();
    });

    it('refuses a redirect_uri the client did not register, without redirecting', async () => {
      const clientId = await client.registerClient();

      const response = await server()
        .get('/oauth/authorize')
        .query({ ...client.authorizeQuery(clientId), redirect_uri: OTHER_ALLOWLISTED_URI })
        .expect(400);

      // Allowlisted globally is not the same as registered by THIS client — the code is
      // delivered to the client's own target, not to any target the server tolerates.
      expect(response.body.error).toBe('invalid_request');
      expect(response.headers.location).toBeUndefined();
    });

    it('reports a bad parameter by redirecting back to the client, with the state', async () => {
      const clientId = await client.registerClient();

      const redirect = await server()
        .get('/oauth/authorize')
        .query({ ...client.authorizeQuery(clientId), resource: `${resource}/not-served` })
        .set('Cookie', [`${OAUTH_TEST_ACCESS_COOKIE}=${await client.sessionToken()}`])
        .expect(302);

      // Once the redirect target is trusted, the error belongs at the client — that is
      // where a client can correlate it with the request it made.
      const location = new URL(redirect.headers.location);
      expect(location.searchParams.get('error')).toBe('invalid_target');
      expect(location.searchParams.get('state')).toBe('the-state');
      expect(location.searchParams.get('code')).toBeNull();
    });
  });

  /**
   * Being the Authorization Server for another application (ADR-0001), which is the half of
   * that decision this suite can see: a client discovering the Community MCP is sent here,
   * and asks for an audience on a host this application does not serve.
   *
   * The Community itself is not running — nothing here needs it. What is under test is that
   * this server recognizes, describes and mints for a Resource of its own registry that it
   * serves nothing of.
   */
  describe('a Resource served by another application', () => {
    const communityClient = new OAuthTestClient(server, () => COMMUNITY_RESOURCE);

    it('accepts it as a resource rather than refusing it as unknown', async () => {
      const clientId = await communityClient.registerClient();

      const redirect = await communityClient.authorize(clientId, await communityClient.sessionToken());

      // The regression: this used to redirect with `invalid_target`, because the only
      // Resources this server knew were the ones it serves — so the Community MCP was
      // undiscoverable to a client no matter how the Community was configured.
      const location = new URL(redirect.headers.location);
      expect(location.pathname).toBe(OAUTH_TEST_CONSENT_PATH);
      expect(location.searchParams.get('consent_id')).toBeTruthy();
    });

    it('describes it on the consent screen in words, not as a bare URL', async () => {
      const clientId = await communityClient.registerClient();
      const session = await communityClient.sessionToken();
      const consentId = await communityClient.consentId(clientId, session);

      const details = await server()
        .get('/oauth/authorize/consent/details')
        .query({ consent_id: consentId })
        .set('Cookie', communityClient.sessionCookie(session))
        .expect(200);

      // A Resource that cannot be described stops the flow with a 500 rather than asking for
      // a blind approval, so registering one without words is a deployment that half works.
      expect(details.body.resources).toEqual([
        { name: expect.any(String), url: COMMUNITY_RESOURCE, description: expect.any(String) },
      ]);
    });

    it('mints a token whose audience is that other host', async () => {
      const pair = await communityClient.completeAuthorizationFlow();

      // Decoded, not verified: what the signature is worth is `cn-oauth-signing.e2e.spec.ts`.
      // The audience is the whole point here — it is what the Community's own guard compares
      // against the URL it was called at, and no suite runs both applications together.
      expect(tokenAudience(pair.accessToken)).toBe(COMMUNITY_RESOURCE);
    });

    it('refuses another path on that host, which is not registered either', async () => {
      const clientId = await communityClient.registerClient();

      const redirect = await server()
        .get('/oauth/authorize')
        .query({ ...communityClient.authorizeQuery(clientId), resource: `${COMMUNITY_API_URL}/mcp/other` })
        .set('Cookie', [`${OAUTH_TEST_ACCESS_COOKIE}=${await communityClient.sessionToken()}`])
        .expect(302);

      // The entry names one Resource, not a host: knowing the Community is not permission to
      // mint for anything it might ever serve.
      expect(new URL(redirect.headers.location).searchParams.get('error')).toBe('invalid_target');
    });
  });

  describe('the code exchange', () => {
    it('yields an access token and a refresh token', async () => {
      const pair = await client.completeAuthorizationFlow();

      expect(pair.accessToken).toBeTruthy();
      expect(pair.refreshToken).toBeTruthy();
    });

    it('refuses a verifier that does not match the challenge', async () => {
      const clientId = await client.registerClient();
      const code = await client.authorizationCode(clientId);

      const response = await server()
        .post('/oauth/token')
        .send({
          grant_type: 'authorization_code',
          code,
          redirect_uri: OAUTH_TEST_REDIRECT_URI,
          client_id: clientId,
          code_verifier: 'g'.repeat(64),
        })
        .expect(400);

      expect(response.body.error).toBe('invalid_grant');
    });

    it('refuses an exchange with no verifier at all', async () => {
      const clientId = await client.registerClient();
      const code = await client.authorizationCode(clientId);

      const response = await server()
        .post('/oauth/token')
        .send({
          grant_type: 'authorization_code',
          code,
          redirect_uri: OAUTH_TEST_REDIRECT_URI,
          client_id: clientId,
        })
        .expect(400);

      // PKCE is what binds the code to the client that started the flow; an omitted
      // verifier must not be read as "this client opted out".
      expect(response.body.error).toBe('invalid_request');
    });

    it('refuses a code presented with a different redirect target', async () => {
      const clientId = await client.registerClient();
      const code = await client.authorizationCode(clientId);

      // The code is bound to the target it was issued for, so intercepting one buys
      // nothing without also controlling that target.
      await server()
        .post('/oauth/token')
        .send({
          grant_type: 'authorization_code',
          code,
          redirect_uri: OTHER_ALLOWLISTED_URI,
          client_id: clientId,
          code_verifier: OAUTH_TEST_CODE_VERIFIER,
        })
        .expect(400);
    });

    it('spends the code, so a second exchange fails', async () => {
      const clientId = await client.registerClient();
      const code = await client.authorizationCode(clientId);
      const exchange = (): supertest.Test =>
        server().post('/oauth/token').send({
          grant_type: 'authorization_code',
          code,
          redirect_uri: OAUTH_TEST_REDIRECT_URI,
          client_id: clientId,
          code_verifier: OAUTH_TEST_CODE_VERIFIER,
        });

      await exchange().expect(200);
      await exchange().expect(400);
    });

    it('refuses a grant type it does not implement', async () => {
      const response = await server()
        .post('/oauth/token')
        .send({ grant_type: 'client_credentials' })
        .expect(400);

      expect(response.body.error).toBe('unsupported_grant_type');
    });
  });

  describe('the refresh grant', () => {
    it('rotates: the presented token is spent and a new one is returned', async () => {
      const pair = await client.completeAuthorizationFlow();

      const renewed = await client.refresh(pair).expect(200);

      expect(renewed.body.refresh_token).toBeTruthy();
      expect(renewed.body.refresh_token).not.toBe(pair.refreshToken);
      expect(renewed.body.access_token).toBeTruthy();
    });

    it('destroys the whole grant when a spent token is replayed', async () => {
      const pair = await client.completeAuthorizationFlow();
      const renewed = await client.refresh(pair).expect(200);
      const current = { clientId: pair.clientId, refreshToken: renewed.body.refresh_token as string };

      // Replay: two holders exist and we cannot tell which is the thief, so the session
      // goes — including the token the legitimate holder is still using.
      await client.refresh(pair).expect(400);
      await client.refresh(current).expect(400);
    });

    it('refuses a token presented by a client it was not issued to', async () => {
      const pair = await client.completeAuthorizationFlow();
      const otherClient = await client.registerClient();

      const response = await client
        .refresh({ clientId: otherClient, refreshToken: pair.refreshToken })
        .expect(400);
      expect(response.body.error).toBe('invalid_grant');

      // The rotation already burned the token, so the grant must be gone rather than left
      // as a live chain the mismatched caller holds a valid token for.
      await client.refresh(pair).expect(400);
    });

    it('refuses a browser session refresh token, which is not a Grant', async () => {
      const login = await server()
        .post('/auth/login')
        .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
        .expect(201);
      const sessionRefreshToken = refreshCookieValue(login);

      const clientId = await client.registerClient();
      const response = await client.refresh({ clientId, refreshToken: sessionRefreshToken }).expect(400);

      // The `kind` on the row is what keeps the two surfaces apart: a browser session must
      // not be convertible into a machine credential here.
      expect(response.body.error).toBe('invalid_grant');
    });

    it('refuses a request to widen the audience on renewal', async () => {
      const pair = await client.completeAuthorizationFlow();

      const response = await server()
        .post('/oauth/token')
        .send({
          grant_type: 'refresh_token',
          refresh_token: pair.refreshToken,
          client_id: pair.clientId,
          resource: `${resource}/somewhere-else`,
        })
        .expect(400);

      // The audience comes from stored state; a request naming a different one is the
      // escalation path, and is rejected rather than quietly ignored.
      expect(response.body.error).toBe('invalid_target');
    });
  });

  describe('revocation', () => {
    it('ends the grant, so renewal stops working', async () => {
      const pair = await client.completeAuthorizationFlow();

      await server()
        .post('/oauth/revoke')
        .send({ token: pair.refreshToken, client_id: pair.clientId })
        .expect(200);

      await client.refresh(pair).expect(400);
    });

    it("is scoped to the client, so one client cannot end another one's grant", async () => {
      const pair = await client.completeAuthorizationFlow();
      const otherClient = await client.registerClient();

      await server()
        .post('/oauth/revoke')
        .send({ token: pair.refreshToken, client_id: otherClient })
        .expect(200);

      // This endpoint is unauthenticated: if it were not scoped, it would be a denial of
      // service against any grant whose token leaked into it.
      await client.refresh(pair).expect(200);
    });

    it('answers 200 for a token that means nothing to us (RFC 7009 §2.2)', async () => {
      await server()
        .post('/oauth/revoke')
        .send({ token: 'never-existed', client_id: 'never-registered' })
        .expect(200);
    });

    it('still rejects a malformed request', async () => {
      const response = await server().post('/oauth/revoke').send({ token: 'a-token' }).expect(400);
      expect(response.body.error).toBe('invalid_request');
    });
  });

  describe('error bodies', () => {
    it("keep the OAuth shape rather than the application's own", async () => {
      const response = await server().post('/oauth/token').send({ grant_type: 'nope' }).expect(400);

      // The global exception filter rewrites every other error to the Constellab shape,
      // which has no `error` field — and that field is what an OAuth client branches on.
      expect(Object.keys(response.body).sort()).toEqual(['error', 'error_description']);
      expect(typeof response.body.error_description).toBe('string');
    });
  });

  /** Full `Set-Cookie` entry for a cookie name, attributes included. */
  function setCookieEntry(response: supertest.Response, name: string): string {
    const raw = response.headers['set-cookie'];
    const cookies: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return cookies.find((cookie) => cookie.startsWith(`${name}=`)) ?? '';
  }

  /** The browser session refresh token a login handed out. */
  function refreshCookieValue(response: supertest.Response): string {
    return setCookieEntry(response, 'Refresh_Token').split(';')[0].substring('Refresh_Token='.length);
  }
});
