import { createPublicKey, generateKeyPairSync } from 'node:crypto';

// Namespace import so the type names (`jwt.JwtHeader`) resolve alongside the functions.
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';

// Relative rather than through `@monorepo/back-core-lib`: this is the fixture the Community
// suite also uses, and mocks are deliberately kept out of the library's public API.
import { BlJwk } from '../../../libs/back-core-lib/src/lib/modules/bl-jwt/bl-jwt-key.class';
import { blVerifyLikeResourceServer } from '../../../libs/back-core-lib/src/lib/modules/bl-jwt/bl-mcp-token.mock';
import { OAUTH_TEST_ACCESS_COOKIE, OAuthTestClient, OAuthTestTokenPair } from './oauth-client.helper';
import { TEST_ADMIN_EMAIL } from './test-credentials';
import { CnTestE2EHelper } from './test-e2e-helper.class';

/** One published key, as it arrives over HTTP. */
interface PublishedJwk {
  kty?: string;
  use?: string;
  alg?: string;
  kid?: string;
  n?: string;
  e?: string;
}

/** A protected route of this application, used to prove a token is not a browser credential. */
const PROTECTED_ROUTE = '/spaces/my-spaces';

/**
 * The signing half of the OAuth flow on the Space API, over HTTP only.
 *
 * Everything asserted here is observable to a client: the discovery documents, the
 * published key set, the header of the token handed out, and what each token is refused
 * for. Nothing reaches into a store or a service — how a key is loaded is covered by the
 * library's own specs.
 *
 * The point of the suite is the split between the two algorithms, which is what makes this
 * application safe to be the single issuer (ADR-0001). An MCP access token is signed with a
 * private key and verified through the published public one; a Session token stays on this
 * application's symmetric secret; and neither is usable where the other belongs.
 *
 * Requires the local MySQL test database and Redis (see TESTING.md); the helper drops and
 * re-creates the database in beforeAll.
 */
describe('OAuth token signing (e2e)', () => {
  const helper = new CnTestE2EHelper('');

  let resource: string;

  const server = (): supertest.Agent => supertest(helper.app.getHttpServer());
  const client = new OAuthTestClient(server, () => resource);

  beforeAll(async () => {
    await helper.initAppModule();
    resource = await registeredResource();
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  /**
   * The Resource this application serves, read from its own discovery document rather than
   * rebuilt from the test environment — the token audience and the URL a client calls have
   * to be the same string, and reading it is how the suite would notice if they stopped
   * being.
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
   * The public key as anyone who fetched the key set holds it. Used both to verify a token
   * the way the Community API will, and to attempt the algorithm-confusion attack that
   * publishing it makes possible.
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

  describe('the published key set', () => {
    it('is served and fetchable without any credential', async () => {
      expect(await publishedKeys()).toHaveLength(1);
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

  describe('the protected resource discovery document', () => {
    it('names this application as its own authorization server', async () => {
      const response = await server().get('/.well-known/oauth-protected-resource').expect(200);
      const metadata = await server().get('/.well-known/oauth-authorization-server').expect(200);

      expect(response.body.resource).toBe(resource);
      expect(response.body.authorization_servers).toEqual([metadata.body.issuer]);
    });

    it('404s on a path that is not a registered Resource', async () => {
      // Answering here would tell a client calling one surface to request an audience for
      // a different one.
      await server().get('/.well-known/oauth-protected-resource/not-a-resource').expect(404);
    });
  });

  describe('an MCP access token', () => {
    let flow: OAuthTestTokenPair;

    beforeAll(async () => {
      flow = await client.completeAuthorizationFlow();
    });

    it('is signed asymmetrically and names the key that signed it', async () => {
      const header = headerOf(flow.accessToken);

      expect(header.alg).toBe('RS256');
      expect(header.kid).toBe((await publishedKey()).kid);
    });

    it('verifies against the published key alone, for the Resource it was granted', async () => {
      // Exactly what the Community API does, holding nothing but this document — and
      // through the shared fixture rather than a local re-implementation of it, so that a
      // change to the token shape breaks here and in the Community suite together instead
      // of leaving one of them quietly testing a token no client is issued.
      const payload = await blVerifyLikeResourceServer(flow.accessToken, {
        keys: (await publishedKeys()) as BlJwk[],
      });

      expect(payload.aud).toBe(resource);
      expect(payload.email).toBe(TEST_ADMIN_EMAIL);
    });

    it('is refused as a browser credential', async () => {
      // It is RS256 and the session verifier accepts HS256 only — and it carries an `aud`,
      // which a Session token never does.
      await server()
        .get(PROTECTED_ROUTE)
        .set('Cookie', [`${OAUTH_TEST_ACCESS_COOKIE}=${flow.accessToken}`])
        .expect(401);
    });
  });

  describe('the refresh grant', () => {
    it('renews an access token that still verifies against the published key', async () => {
      const flow = await client.completeAuthorizationFlow();

      const renewed = await client.refresh(flow).expect(200);
      const accessToken = renewed.body.access_token as string;

      expect(headerOf(accessToken).alg).toBe('RS256');
      const payload = jwt.verify(accessToken, pemFor(await publishedKey()), {
        algorithms: ['RS256'],
      }) as { aud: string };

      // The audience is replayed from the stored Grant, not from the renewing request.
      expect(payload.aud).toBe(resource);
    });
  });

  describe('browser login is unaffected', () => {
    it('still mints a symmetric Session token', async () => {
      expect(headerOf(await client.sessionToken()).alg).toBe('HS256');
    });

    it('still reaches a protected route', async () => {
      await server()
        .get(PROTECTED_ROUTE)
        .set('Cookie', [`${OAUTH_TEST_ACCESS_COOKIE}=${await client.sessionToken()}`])
        .expect(200);
    });

    it('carries no audience, so it can never be mistaken for a Grant', async () => {
      // The structural half of the split: `aud` is what a Resource Server checks, and a
      // token without one matches no Resource.
      const payload = jwt.decode(await client.sessionToken()) as { aud?: unknown };
      expect(payload.aud).toBeUndefined();
    });
  });

  describe('a forged token is refused wherever it is presented', () => {
    /** A payload that would be accepted if only the signature held up. */
    const claims = (): object => ({ sub: 'user-1', email: TEST_ADMIN_EMAIL });

    it('refuses a token signed symmetrically with the published public key as the secret', async () => {
      const jwk = await publishedKey();

      // The attack publishing a key makes possible: the public key is fetchable by anyone,
      // so a verifier that accepted HS256 as well as RS256 would treat it as a shared
      // secret and let anyone mint a credential for any user.
      const forged = jwt.sign(claims(), pemFor(jwk), {
        algorithm: 'HS256',
        keyid: jwk.kid,
        expiresIn: 3600,
      });

      await server()
        .get(PROTECTED_ROUTE)
        .set('Cookie', [`${OAUTH_TEST_ACCESS_COOKIE}=${forged}`])
        .expect(401);
    });

    it('refuses an unsigned token claiming alg none', async () => {
      const unsigned = jwt.sign(claims(), '', { algorithm: 'none' });

      await server()
        .get(PROTECTED_ROUTE)
        .set('Cookie', [`${OAUTH_TEST_ACCESS_COOKIE}=${unsigned}`])
        .expect(401);
    });

    it('refuses a well-formed token signed by a key it does not publish', async () => {
      const foreignKey = generateKeyPairSync('rsa', { modulusLength: 2048 })
        .privateKey.export({ type: 'pkcs8', format: 'pem' })
        .toString();

      const foreign = jwt.sign(claims(), foreignKey, {
        algorithm: 'RS256',
        keyid: (await publishedKey()).kid,
        expiresIn: 3600,
      });

      await server()
        .get(PROTECTED_ROUTE)
        .set('Cookie', [`${OAUTH_TEST_ACCESS_COOKIE}=${foreign}`])
        .expect(401);
    });
  });
});
