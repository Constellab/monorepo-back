import { createHash, createPublicKey, generateKeyPairSync } from 'node:crypto';

import * as jwt from 'jsonwebtoken';
// Namespace import, matching test-e2e-helper.class.ts: `esModuleInterop` is off, so a
// default import would compile but be undefined at runtime.
import * as supertest from 'supertest';

import { TEST_ADMIN_EMAIL } from './test-credentials';
import { HnTestE2EHelper } from './test-e2e-helper.class';

const ACCESS_COOKIE = 'Authorization';
const REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';

/** Real PKCE pair, so the exchange goes through the same check a client faces. */
const CODE_VERIFIER = 'v'.repeat(64);
const CODE_CHALLENGE = createHash('sha256').update(CODE_VERIFIER).digest('base64url');

interface TokenPair {
  clientId: string;
  accessToken: string;
  refreshToken: string;
}

/** One published key, as it arrives over HTTP. */
interface PublishedJwk {
  kty?: string;
  use?: string;
  alg?: string;
  kid?: string;
  n?: string;
  e?: string;
}

/**
 * The signing half of the OAuth flow, over HTTP only.
 *
 * Everything asserted here is observable to a client: the discovery documents, the
 * published key set, the header of the token handed out, and whether a subsequent call
 * succeeds. Nothing reaches into a store or a service — the internals of how a key is
 * loaded are covered by the library's own specs.
 *
 * The point of the suite is the split between the two algorithms. An MCP access token is
 * signed with a private key and verified through the published public one; a Session token
 * stays on this application's symmetric secret; and neither is usable where the other
 * belongs. The interesting cases are the last three describes — a token forged with the
 * *published* key, and each token presented on the other's surface.
 *
 * Requires the local MySQL test database and Redis (see TESTING.md); the helper drops and
 * re-creates the database in beforeAll.
 */
describe('OAuth token signing (e2e)', () => {
  const helper = new HnTestE2EHelper('');

  let resource: string;

  beforeAll(async () => {
    await helper.initAppModule();
    resource = await registeredResource();
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  const server = (): supertest.Agent => supertest(helper.app.getHttpServer());

  /**
   * The resource identifier this application serves, read from its own discovery
   * document rather than rebuilt from the test environment — the token audience and the
   * URL a client calls have to be the same string, and reading it is how the suite would
   * notice if they stopped being.
   */
  async function registeredResource(): Promise<string> {
    const response = await server().get('/.well-known/oauth-protected-resource').expect(200);
    return response.body.resource as string;
  }

  /** The published key set. */
  async function publishedKeys(): Promise<PublishedJwk[]> {
    const response = await server().get('/.well-known/jwks.json').expect(200);
    return response.body.keys as PublishedJwk[];
  }

  /** The single published key, which is what a deployment outside a rotation has. */
  async function publishedKey(): Promise<PublishedJwk> {
    const keys = await publishedKeys();
    expect(keys).toHaveLength(1);
    return keys[0];
  }

  /**
   * The public key as anyone who fetched the key set holds it. Used both to verify a
   * token the way a Resource Server in another application would, and to attempt the
   * algorithm-confusion attack that publishing it makes possible.
   */
  function pemFor(jwk: PublishedJwk): string {
    return createPublicKey({ key: jwk, format: 'jwk' }).export({ type: 'spki', format: 'pem' }).toString();
  }

  /** Decoded header of a token, without verifying it. */
  function headerOf(token: string): jwt.JwtHeader {
    const decoded = jwt.decode(token, { complete: true });
    if (decoded == null) {
      throw new Error('token is not a JWT');
    }
    return decoded.header;
  }

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

  /**
   * The whole flow a client runs: register, authorize as a logged-in user, exchange the
   * code. Returns the pair, so the tests below assert on what a client actually receives.
   */
  async function completeAuthorizationFlow(): Promise<TokenPair> {
    const clientId = await registerClient();
    const session = await sessionToken();

    const redirect = await server()
      .get('/oauth/authorize')
      .query({
        client_id: clientId,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        code_challenge: CODE_CHALLENGE,
        code_challenge_method: 'S256',
        resource,
      })
      .set('Cookie', [`${ACCESS_COOKIE}=${session}`])
      .expect(302);

    const code = new URL(redirect.headers.location).searchParams.get('code');
    expect(code).toBeTruthy();

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

  describe('the published key set', () => {
    it('is served and fetchable without any credential', async () => {
      const keys = await publishedKeys();
      expect(keys).toHaveLength(1);
    });

    it('describes a signing key for exactly one algorithm', async () => {
      const jwk = await publishedKey();

      expect(jwk.kty).toBe('RSA');
      expect(jwk.use).toBe('sig');
      expect(jwk.alg).toBe('RS256');
      expect(jwk.kid).toBeTruthy();
    });

    it('publishes no private member, so fetching it grants no ability to mint', async () => {
      expect(Object.keys(await publishedKey()).sort()).toEqual(['alg', 'e', 'kid', 'kty', 'n', 'use']);
    });

    it('is advertised by the authorization server metadata document', async () => {
      const metadata = await server().get('/.well-known/oauth-authorization-server').expect(200);

      // A Resource Server resolves this from the issuer and has no other way to find the
      // keys, so the advertised URL must be the route that actually answers.
      const advertised = new URL(metadata.body.jwks_uri as string);
      await server().get(advertised.pathname).expect(200);
    });
  });

  describe('an MCP access token', () => {
    let flow: TokenPair;

    beforeAll(async () => {
      flow = await completeAuthorizationFlow();
    });

    it('is signed asymmetrically and names the key that signed it', async () => {
      const header = headerOf(flow.accessToken);

      expect(header.alg).toBe('RS256');
      expect(header.kid).toBe((await publishedKey()).kid);
    });

    it('verifies against the published key alone', async () => {
      // Exactly what a Resource Server in another application will do, holding nothing
      // but this document.
      const payload = jwt.verify(flow.accessToken, pemFor(await publishedKey()), {
        algorithms: ['RS256'],
      }) as { aud: string };

      expect(payload.aud).toBe(resource);
    });

    it('reaches the MCP', async () => {
      const response = await callMcp(flow.accessToken);

      expect(response.status).not.toBe(401);
      // The guard sets this on every refusal, so its absence is the accept.
      expect(response.headers['www-authenticate']).toBeUndefined();
    });
  });

  describe('the refresh grant', () => {
    it('renews an access token that still verifies against the published key', async () => {
      const flow = await completeAuthorizationFlow();

      const renewed = await server()
        .post('/oauth/token')
        .send({
          grant_type: 'refresh_token',
          refresh_token: flow.refreshToken,
          client_id: flow.clientId,
        })
        .expect(200);

      const accessToken = renewed.body.access_token as string;

      expect(headerOf(accessToken).alg).toBe('RS256');
      expect(jwt.verify(accessToken, pemFor(await publishedKey()), { algorithms: ['RS256'] })).toBeTruthy();

      const response = await callMcp(accessToken);
      expect(response.status).not.toBe(401);
    });
  });

  describe('the algorithm is pinned', () => {
    /** A payload that would be accepted if only the signature held up. */
    const claims = (): object => ({ sub: 'user-1', email: TEST_ADMIN_EMAIL, aud: resource });

    it('refuses a token signed symmetrically with the published public key as the secret', async () => {
      const jwk = await publishedKey();

      // The attack publishing a key makes possible: the public key is fetchable by
      // anyone, so a guard that accepted HS256 as well as RS256 would treat it as a shared
      // secret and let anyone mint a token for any user.
      const forged = jwt.sign(claims(), pemFor(jwk), {
        algorithm: 'HS256',
        keyid: jwk.kid,
        expiresIn: 3600,
      });

      await callMcp(forged).expect(401);
    });

    it('refuses an unsigned token claiming alg none', async () => {
      const unsigned = jwt.sign(claims(), null, {
        algorithm: 'none',
        keyid: (await publishedKey()).kid,
      });

      await callMcp(unsigned).expect(401);
    });

    it('refuses a well-formed token signed by a key it does not publish', async () => {
      const foreignKey = generateKeyPairSync('rsa', { modulusLength: 2048 })
        .privateKey.export({ type: 'pkcs8', format: 'pem' })
        .toString();

      // Signed properly, and claiming the `kid` of the key that is published: the `kid`
      // selects which key to check against, the signature is what authorizes.
      const foreign = jwt.sign(claims(), foreignKey, {
        algorithm: 'RS256',
        keyid: (await publishedKey()).kid,
        expiresIn: 3600,
      });

      await callMcp(foreign).expect(401);
    });

    it('refuses a request with no token at all', async () => {
      await callMcp().expect(401);
    });
  });

  describe('the two token kinds stay apart', () => {
    it('refuses a Session token on the MCP', async () => {
      // It carries no `aud`, and it is signed with the wrong algorithm for this surface.
      await callMcp(await sessionToken()).expect(401);
    });

    it('refuses an MCP access token as a browser credential', async () => {
      const { accessToken } = await completeAuthorizationFlow();

      // The reverse direction, and the one the pinned session algorithm closes: this
      // token is RS256 and the session verifier accepts HS256 only.
      await server()
        .get('/user')
        .set('Cookie', [`${ACCESS_COOKIE}=${accessToken}`])
        .expect(401);
    });
  });

  describe('browser login is unaffected', () => {
    it('still mints a symmetric Session token', async () => {
      expect(headerOf(await sessionToken()).alg).toBe('HS256');
    });

    it('still reaches a protected route', async () => {
      const response = await server()
        .get('/user')
        .set('Cookie', [`${ACCESS_COOKIE}=${await sessionToken()}`])
        .expect(200);

      expect(response.body.email).toBe(TEST_ADMIN_EMAIL);
    });
  });
});
