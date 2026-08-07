import { createHash } from 'node:crypto';

// Namespace import, matching test-e2e-helper.class.ts: `esModuleInterop` is off, so a
// default import would compile but be undefined at runtime.
import * as supertest from 'supertest';

import { TEST_ADMIN_EMAIL } from './test-credentials';
import { HnTestE2EHelper } from './test-e2e-helper.class';

const ACCESS_COOKIE = 'Authorization';

/** One of `OAUTH_ALLOWED_REDIRECT_URIS` in hn-test.env. */
const REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';

/** Real PKCE pair, so the exchange goes through the same check a client faces. */
const CODE_VERIFIER = 'f'.repeat(64);
const CODE_CHALLENGE = createHash('sha256').update(CODE_VERIFIER).digest('base64url');

interface TokenPair {
  clientId: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * The OAuth flow itself, end to end and over HTTP only: registration and its redirect
 * policy, `/authorize` logged out and logged in, the code exchange, rotation, replay and
 * revocation.
 *
 * The complement to `hn-oauth-signing.e2e.spec.ts`, which covers what the token is signed
 * with. This suite covers the protocol around it, and exists because the whole server moved
 * into `bl-oauth-server`: every assertion here is something a client observes, so it holds
 * whichever application mounts the module and would go red if the move changed behaviour.
 *
 * Nothing reaches into a store or a service. That is not incidental — the codes, the
 * registrations and the refresh token rows are all internals now, and a suite asserting on
 * them would break on the next refactor while telling a client nothing.
 *
 * Requires the local MySQL test database and Redis (see TESTING.md); the helper drops and
 * re-creates the database in beforeAll.
 */
describe('OAuth flow (e2e)', () => {
  const helper = new HnTestE2EHelper('');

  let resource: string;

  beforeAll(async () => {
    await helper.initAppModule();
    const response = await server().get('/.well-known/oauth-protected-resource').expect(200);
    resource = response.body.resource as string;
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  const server = (): supertest.Agent => supertest(helper.app.getHttpServer());

  /** The session cookie of a logged-in browser. */
  async function sessionToken(): Promise<string> {
    const response = await server()
      .post('/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: 'anything' })
      .expect(201);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const entry = cookies.find((cookie) => cookie.startsWith(`${ACCESS_COOKIE}=`)) ?? '';
    return entry.split(';')[0].substring(`${ACCESS_COOKIE}=`.length);
  }

  /** Register a public client, as an MCP client does on first connection. */
  async function registerClient(): Promise<string> {
    const response = await server()
      .post('/oauth/register')
      .send({ redirect_uris: [REDIRECT_URI], client_name: 'e2e client' })
      .expect(201);
    return response.body.client_id as string;
  }

  function authorizeQuery(clientId: string): Record<string, string> {
    return {
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      code_challenge: CODE_CHALLENGE,
      code_challenge_method: 'S256',
      resource,
      state: 'the-state',
    };
  }

  /** Drive `/authorize` as a logged-in browser and return the code it redirects with. */
  async function authorizationCode(clientId: string): Promise<string> {
    const redirect = await server()
      .get('/oauth/authorize')
      .query(authorizeQuery(clientId))
      .set('Cookie', [`${ACCESS_COOKIE}=${await sessionToken()}`])
      .expect(302);

    const code = new URL(redirect.headers.location).searchParams.get('code');
    expect(code).toBeTruthy();
    return code!;
  }

  /** The whole flow a client runs: register, authorize, exchange. */
  async function completeAuthorizationFlow(): Promise<TokenPair> {
    const clientId = await registerClient();
    const code = await authorizationCode(clientId);

    const token = await server()
      .post('/oauth/token')
      .send({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: clientId,
        code_verifier: CODE_VERIFIER,
      })
      .expect(200);

    return {
      clientId,
      accessToken: token.body.access_token as string,
      refreshToken: token.body.refresh_token as string,
    };
  }

  function refresh(pair: { clientId: string; refreshToken: string }): supertest.Test {
    return server().post('/oauth/token').send({
      grant_type: 'refresh_token',
      refresh_token: pair.refreshToken,
      client_id: pair.clientId,
    });
  }

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
        .send({ redirect_uris: [REDIRECT_URI] })
        .expect(201);

      expect(response.body.client_id).toBeTruthy();
      expect(response.body.redirect_uris).toEqual([REDIRECT_URI]);
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
      const clientId = await registerClient();

      const redirect = await server().get('/oauth/authorize').query(authorizeQuery(clientId)).expect(302);

      const location = new URL(redirect.headers.location);
      expect(location.pathname).toBe('/login');
      // Without a returnUrl the user logs in and lands somewhere unrelated, and the client
      // never receives a code — the flow ends silently.
      const returnUrl = location.searchParams.get('returnUrl');
      expect(returnUrl).toContain('/oauth/authorize');
      expect(returnUrl).toContain(`client_id=${clientId}`);
    });

    it('redirects a logged-in user back to the client with a code and the state', async () => {
      const clientId = await registerClient();

      const redirect = await server()
        .get('/oauth/authorize')
        .query(authorizeQuery(clientId))
        .set('Cookie', [`${ACCESS_COOKIE}=${await sessionToken()}`])
        .expect(302);

      const location = new URL(redirect.headers.location);
      expect(`${location.origin}${location.pathname}`).toBe(REDIRECT_URI);
      expect(location.searchParams.get('code')).toBeTruthy();
      expect(location.searchParams.get('state')).toBe('the-state');
    });

    it('refuses an unknown client_id without redirecting anywhere', async () => {
      const response = await server()
        .get('/oauth/authorize')
        .query({ ...authorizeQuery('not-a-registered-client') })
        .expect(400);

      // Redirecting here would be an open redirect: neither the client nor the target has
      // been validated yet.
      expect(response.body.error).toBe('invalid_client');
      expect(response.headers.location).toBeUndefined();
    });

    it('refuses a redirect_uri the client did not register, without redirecting', async () => {
      const clientId = await registerClient();

      const response = await server()
        .get('/oauth/authorize')
        .query({ ...authorizeQuery(clientId), redirect_uri: 'https://claude.com/api/mcp/auth_callback' })
        .expect(400);

      expect(response.body.error).toBe('invalid_request');
      expect(response.headers.location).toBeUndefined();
    });

    it('reports a bad parameter by redirecting back to the client, with the state', async () => {
      const clientId = await registerClient();

      const redirect = await server()
        .get('/oauth/authorize')
        .query({ ...authorizeQuery(clientId), resource: `${resource}-not-served` })
        .set('Cookie', [`${ACCESS_COOKIE}=${await sessionToken()}`])
        .expect(302);

      // Once the redirect target is trusted, the error belongs at the client — that is
      // where a client can correlate it with the request it made.
      const location = new URL(redirect.headers.location);
      expect(location.searchParams.get('error')).toBe('invalid_target');
      expect(location.searchParams.get('state')).toBe('the-state');
      expect(location.searchParams.get('code')).toBeNull();
    });
  });

  describe('the code exchange', () => {
    it('yields an access token and a refresh token', async () => {
      const pair = await completeAuthorizationFlow();

      expect(pair.accessToken).toBeTruthy();
      expect(pair.refreshToken).toBeTruthy();
    });

    it('refuses a verifier that does not match the challenge', async () => {
      const clientId = await registerClient();
      const code = await authorizationCode(clientId);

      const response = await server()
        .post('/oauth/token')
        .send({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: clientId,
          code_verifier: 'g'.repeat(64),
        })
        .expect(400);

      expect(response.body.error).toBe('invalid_grant');
    });

    it('refuses a code presented with a different redirect target', async () => {
      const clientId = await registerClient();
      const code = await authorizationCode(clientId);

      // The code is bound to the target it was issued for, so intercepting one buys
      // nothing without also controlling that target.
      await server()
        .post('/oauth/token')
        .send({
          grant_type: 'authorization_code',
          code,
          redirect_uri: 'https://claude.com/api/mcp/auth_callback',
          client_id: clientId,
          code_verifier: CODE_VERIFIER,
        })
        .expect(400);
    });

    it('spends the code, so a second exchange fails', async () => {
      const clientId = await registerClient();
      const code = await authorizationCode(clientId);
      const exchange = (): supertest.Test =>
        server().post('/oauth/token').send({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: clientId,
          code_verifier: CODE_VERIFIER,
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
      const pair = await completeAuthorizationFlow();

      const renewed = await refresh(pair).expect(200);

      expect(renewed.body.refresh_token).toBeTruthy();
      expect(renewed.body.refresh_token).not.toBe(pair.refreshToken);
      expect(renewed.body.access_token).toBeTruthy();
    });

    it('destroys the whole grant when a spent token is replayed', async () => {
      const pair = await completeAuthorizationFlow();
      const renewed = await refresh(pair).expect(200);
      const current = { clientId: pair.clientId, refreshToken: renewed.body.refresh_token as string };

      // Replay: two holders exist and we cannot tell which is the thief, so the session
      // goes — including the token the legitimate holder is still using.
      await refresh(pair).expect(400);
      await refresh(current).expect(400);
    });

    it('refuses a token presented by a client it was not issued to', async () => {
      const pair = await completeAuthorizationFlow();
      const otherClient = await registerClient();

      const response = await refresh({ clientId: otherClient, refreshToken: pair.refreshToken }).expect(400);
      expect(response.body.error).toBe('invalid_grant');

      // The rotation already burned the token, so the grant must be gone rather than left
      // as a live chain the mismatched caller holds a valid token for.
      await refresh(pair).expect(400);
    });

    it('refuses a request to widen the audience on renewal', async () => {
      const pair = await completeAuthorizationFlow();

      const response = await server()
        .post('/oauth/token')
        .send({
          grant_type: 'refresh_token',
          refresh_token: pair.refreshToken,
          client_id: pair.clientId,
          resource: `${resource}-somewhere-else`,
        })
        .expect(400);

      // The audience comes from stored state; a request naming a different one is the
      // escalation path, and is rejected rather than quietly ignored.
      expect(response.body.error).toBe('invalid_target');
    });
  });

  describe('revocation', () => {
    it('ends the grant, so renewal stops working', async () => {
      const pair = await completeAuthorizationFlow();

      await server()
        .post('/oauth/revoke')
        .send({ token: pair.refreshToken, client_id: pair.clientId })
        .expect(200);

      await refresh(pair).expect(400);
    });

    it("is scoped to the client, so one client cannot end another one's grant", async () => {
      const pair = await completeAuthorizationFlow();
      const otherClient = await registerClient();

      await server()
        .post('/oauth/revoke')
        .send({ token: pair.refreshToken, client_id: otherClient })
        .expect(200);

      // This endpoint is unauthenticated: if it were not scoped, it would be a denial of
      // service against any grant whose token leaked into it.
      await refresh(pair).expect(200);
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
});
