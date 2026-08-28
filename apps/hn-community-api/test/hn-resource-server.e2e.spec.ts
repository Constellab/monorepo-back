// Namespace import, matching test-e2e-helper.class.ts: `esModuleInterop` is off, so a
// default import would compile but be undefined at runtime.
import * as supertest from 'supertest';

// Relative rather than through `@monorepo/back-core-lib`: this is the shared fixture the
// Space API suite also uses, and mocks are deliberately kept out of the library's public
// API so nothing in an application can reach for one by accident.
import { BlTestAuthorizationServer } from '../../../libs/back-core-lib/src/lib/modules/bl-jwt/bl-mcp-token.mock';
import { TEST_ADMIN_EMAIL, TEST_ADMIN_ID, TEST_ADMIN_PASSWORD } from './test-credentials';
import { HnTestE2EHelper } from './test-e2e-helper.class';

/** The Session token cookie, as the browser carries it. */
const SESSION_COOKIE = 'Authorization';

/** The browser refresh token cookie. Its own row, unrelated to any Grant. */
const REFRESH_COOKIE = 'Refresh_Token';

/**
 * The single Authorization Server, as this environment reaches it — what
 * `HnCoreConfigService.getSpaceApiUrl()` returns under the `test` profile.
 *
 * Stated as a literal rather than read back from the config service on purpose: asserting
 * that the document names whatever the application happens to be configured with would pass
 * for any value, including the one bug that matters here — pointing clients at the wrong
 * host. Written out, this fails the day the wiring changes without someone meaning it to.
 */
const SPACE_API_URL = 'http://localhost:3001';

/**
 * The Community as a Resource Server, over HTTP only.
 *
 * The cutover is what this covers: this application no longer issues anything. It serves
 * discovery documents naming the Space API, verifies tokens minted there against the key
 * set published there, and serves none of the endpoints it used to.
 *
 * The Authorization Server is a different application, so the one thing substituted is the
 * published key set — through {@link BlTestAuthorizationServer}, the same fixture the Space
 * API suite asserts its real tokens verify through. That is what makes a drift on either
 * side turn something red without booting both applications in one run.
 *
 * Everything else is real and everything asserted is observable to a client: status codes,
 * the `WWW-Authenticate` header, discovery document contents, and whether a call gets
 * through. Nothing reaches into a store or a service.
 *
 * Requires the local MySQL test database and Redis (see TESTING.md); the helper drops and
 * re-creates the database in beforeAll.
 */
describe('The Community as a Resource Server (e2e)', () => {
  const helper = new HnTestE2EHelper('');

  /** Stands in for the Space API: mints tokens, publishes the keys they verify against. */
  const spaceApi = BlTestAuthorizationServer.generate();

  let resource: string;

  const server = (): supertest.Agent => supertest(helper.app.getHttpServer());

  beforeAll(async () => {
    await helper.initAppModule({ mcpKeySource: spaceApi.keySource() });
    resource = await registeredResource();
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  /**
   * The Resource this application serves, read from its own discovery document rather
   * than rebuilt from the test environment — the token audience and the URL a client calls
   * have to be the same string, and reading it is how the suite would notice if they
   * stopped being.
   */
  async function registeredResource(): Promise<string> {
    const response = await server().get('/.well-known/oauth-protected-resource').expect(200);
    return response.body.resource as string;
  }

  /**
   * Call the MCP with a bearer token. Returns the raw response so a test can distinguish
   * "the guard refused" from "the guard accepted and the MCP answered".
   */
  function callMcp(token?: string): supertest.Test {
    const request = server()
      .post(new URL(resource).pathname)
      .set('Accept', 'application/json, text/event-stream')
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });

    return token == null ? request : request.set('Authorization', `Bearer ${token}`);
  }

  /**
   * Call one MCP tool. Same envelope as {@link callMcp}, one JSON-RPC method deeper: what a
   * client actually does once `tools/list` told it what is there.
   */
  function callTool(token: string, name: string, args: Record<string, unknown> = {}): supertest.Test {
    return server()
      .post(new URL(resource).pathname)
      .set('Accept', 'application/json, text/event-stream')
      .set('Authorization', `Bearer ${token}`)
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
  }

  /** A token for this Resource, as the Space API would mint it. */
  function mcpAccessToken(overrides: Parameters<typeof spaceApi.mintMcpAccessToken>[0] = {}): string {
    return spaceApi.mintMcpAccessToken({ audience: resource, ...overrides });
  }

  /**
   * A token acting as a user who exists on both sides — the seeded admin, whose id is the
   * `sub` the Space API would put in a token for them.
   *
   * The default `sub` of the fixture names nobody in this database, so it is no longer a
   * token that gets through: every call now resolves its subject to an `HnUser` first
   * (ADR-0004). Spelling the synchronized case out is what keeps the accepting tests
   * asserting an accept rather than a differently-shaped refusal.
   */
  function syncedUserToken(): string {
    return mcpAccessToken({ sub: TEST_ADMIN_ID, email: TEST_ADMIN_EMAIL });
  }

  /** Log in as a browser does. */
  async function login(): Promise<supertest.Response> {
    return server()
      .post('/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
      .expect(201);
  }

  /** The value of one cookie a response set, without its attributes. */
  function cookieValue(response: supertest.Response, name: string): string {
    const cookies = (response.headers['set-cookie'] as unknown as string[]) ?? [];
    const entry = cookies.find((cookie) => cookie.startsWith(`${name}=`)) ?? '';
    return entry.split(';')[0].substring(`${name}=`.length);
  }

  /** The Session token of a logged-in browser. */
  async function sessionToken(): Promise<string> {
    return cookieValue(await login(), SESSION_COOKIE);
  }

  describe('the discovery documents name the Space API', () => {
    it('sends a client to the Space API for a token, not here', async () => {
      const response = await server()
        .get(`/.well-known/oauth-protected-resource${new URL(resource).pathname}`)
        .expect(200);

      expect(response.body.resource).toBe(resource);

      // The whole of the cutover as a client sees it. The Resource stays on this host;
      // only where a token is obtained moves.
      const authorizationServers = response.body.authorization_servers as string[];
      expect(authorizationServers).toEqual([SPACE_API_URL]);

      // Stated separately because it is the property that actually matters, and asserting
      // the URL alone would not pin it: a client refused here must be sent somewhere that
      // is not here. One Authorization Server, and it is not this application (ADR-0001).
      expect(new URL(authorizationServers[0]).host).not.toBe(new URL(resource).host);
    });

    it('serves the same answer on the pathless document', async () => {
      const response = await server().get('/.well-known/oauth-protected-resource').expect(200);

      expect(response.body.resource).toBe(resource);
    });

    it('404s on a path that is not a registered resource', async () => {
      // Answering here would tell a client calling one surface to request an audience for
      // a different one.
      await server().get('/.well-known/oauth-protected-resource/mcp/not-a-resource').expect(404);
    });

    it('advertises, on refusal, a document that actually resolves', async () => {
      const refused = await callMcp().expect(401);

      const advertised = /resource_metadata="([^"]+)"/.exec(refused.headers['www-authenticate'] ?? '');
      expect(advertised).not.toBeNull();

      const document = await server().get(new URL(advertised![1]).pathname).expect(200);
      expect(document.body.resource).toBe(resource);
    });
  });

  describe('the guard accepts a token from the Space API', () => {
    it('lets a well-formed token through to the MCP', async () => {
      const response = await callMcp(syncedUserToken()).expect(200);

      // The guard sets this on every refusal, so its absence is the accept.
      expect(response.headers['www-authenticate']).toBeUndefined();
      expect(response.body.error).toBeUndefined();
    });

    it('serves the read tools to a synchronized account exactly as before', async () => {
      // The whole risk of putting an identity resolution in front of these: a read that used
      // to answer must still answer, with the same payload shape, for an account that exists.
      const response = await callTool(syncedUserToken(), 'community_doc_list', { limit: 5 }).expect(200);

      expect(response.body.error).toBeUndefined();
      expect(response.body.result.isError).toBeFalsy();

      const payload = JSON.parse(response.body.result.content[0].text);
      expect(payload.count).toBe(payload.results.length);
    });
  });

  describe('the guard refuses', () => {
    it('a token minted for another Resource', async () => {
      await callMcp(mcpAccessToken({ audience: 'https://api.example.com/mcp/space-api' })).expect(401);
    });

    it('a token carrying no audience at all', async () => {
      await callMcp(spaceApi.mintMcpAccessToken()).expect(401);
    });

    it('an expired token', async () => {
      await callMcp(mcpAccessToken({ expiresInSeconds: -60 })).expect(401);
    });

    it('a token naming a key the Space API does not publish', async () => {
      await callMcp(mcpAccessToken({ kid: 'not-published' })).expect(401);
    });

    it('a request with no token at all', async () => {
      await callMcp().expect(401);
    });
  });

  describe('an intact token still needs a Community account', () => {
    it('refuses a token whose user was never synchronized here, and says why', async () => {
      // 403, not 401, and deliberately: the token is intact and minted for this Resource, so
      // a client sent back through the OAuth flow would return with the same token and loop.
      // The code is the assertion rather than the sentence — the sentence is translated.
      const response = await callMcp(mcpAccessToken({ sub: 'never-synchronized-here' })).expect(403);

      expect(response.body.code).toBe('error.mcp_no_community_account');

      // No challenge: re-authenticating is not the fix, so nothing must invite it.
      expect(response.headers['www-authenticate']).toBeUndefined();
    });

    it('creates nothing on that path, so retrying with the same token is refused again', async () => {
      const token = mcpAccessToken({ sub: 'never-synchronized-here' });

      await callMcp(token).expect(403);
      // An on-the-fly account would show up here as a second call getting through — the
      // token carries `sub` and an email and nothing else a user record needs.
      await callMcp(token).expect(403);
    });
  });

  describe('the algorithm is pinned', () => {
    it('refuses a token signed symmetrically with the published public key as the secret', async () => {
      // The attack that publishing a key makes possible, and the reason the cutover was a
      // clean break rather than a window accepting both algorithms: the public key is
      // fetchable by anyone, so a guard accepting HS256 too would treat it as a shared
      // secret and let anyone mint a token for any user.
      await callMcp(mcpAccessToken({ algorithm: 'HS256' })).expect(401);
    });

    it('refuses an unsigned token claiming alg none', async () => {
      await callMcp(mcpAccessToken({ algorithm: 'none' })).expect(401);
    });

    it('refuses a token signed by a key set this application does not verify against', async () => {
      // Signed properly, by a real Authorization Server — just not the one this Resource
      // Server was told to trust.
      const impostor = BlTestAuthorizationServer.generate();

      await callMcp(impostor.mintMcpAccessToken({ audience: resource })).expect(401);
    });
  });

  describe('the two token kinds stay apart', () => {
    it('refuses a Session token on the MCP', async () => {
      // It carries no `aud`, and it is signed with the wrong algorithm for this surface.
      await callMcp(await sessionToken()).expect(401);
    });

    it('refuses an MCP access token as a browser credential', async () => {
      // The reverse direction, and the one the pinned session algorithm closes: this token
      // is RS256 and the session verifier accepts HS256 only.
      await server()
        .get('/user')
        .set('Cookie', [`${SESSION_COOKIE}=${mcpAccessToken()}`])
        .expect(401);
    });
  });

  describe('this application issues nothing', () => {
    it('serves no authorization server metadata document', async () => {
      // A client resolving an issuer from here would find a second Authorization Server
      // for one set of accounts, which is exactly what ADR-0001 rules out.
      await server().get('/.well-known/oauth-authorization-server').expect(404);
    });

    it('publishes no key set, because it holds no signing key', async () => {
      await server().get('/.well-known/jwks.json').expect(404);
    });

    it('registers no clients', async () => {
      await server()
        .post('/oauth/register')
        .send({ redirect_uris: ['https://claude.ai/api/mcp/auth_callback'], client_name: 'e2e' })
        .expect(404);
    });

    it('serves no authorization endpoint', async () => {
      await server().get('/oauth/authorize').expect(404);
    });

    it('serves no token endpoint', async () => {
      await server().post('/oauth/token').send({ grant_type: 'authorization_code' }).expect(404);
    });

    it('serves no revocation endpoint', async () => {
      await server().post('/oauth/revoke').send({ token: 'anything' }).expect(404);
    });

    it('serves no consent endpoints', async () => {
      await server().get('/oauth/authorize/consent/details').expect(404);
      await server().post('/oauth/authorize/consent/token').send({ consent_id: 'x' }).expect(404);
      await server().get('/oauth/authorize/consent/decision').expect(404);
    });
  });

  /**
   * The half of this application the cutover was not supposed to touch. `hn-auth.e2e.spec.ts`
   * is where browser authentication is actually covered; these three are here because the
   * module wiring changed underneath them, and "unaffected" is a claim worth asserting in
   * the suite that made the change.
   */
  describe('browser login is unaffected', () => {
    it('logs in and reaches a protected route', async () => {
      const response = await server()
        .get('/user')
        .set('Cookie', [`${SESSION_COOKIE}=${await sessionToken()}`])
        .expect(200);

      expect(response.body.email).toBe(TEST_ADMIN_EMAIL);
    });

    it("renews a session, on this application's own refresh token and not a Grant", async () => {
      const refreshToken = cookieValue(await login(), REFRESH_COOKIE);

      const renewed = await server()
        .post('/auth/refresh')
        .set('Cookie', [`${REFRESH_COOKIE}=${refreshToken}`])
        .expect(201);

      expect(cookieValue(renewed, SESSION_COOKIE)).toBeTruthy();
    });

    it('logs out, which ends the session server-side', async () => {
      const refreshToken = cookieValue(await login(), REFRESH_COOKIE);

      await server()
        .post('/auth/logout')
        .set('Cookie', [`${REFRESH_COOKIE}=${refreshToken}`])
        .send({})
        .expect(201);

      await server()
        .post('/auth/refresh')
        .set('Cookie', [`${REFRESH_COOKIE}=${refreshToken}`])
        .expect(401);
    });
  });
});
