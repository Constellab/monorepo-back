import * as jwt from 'jsonwebtoken';

import { BL_JWT_SESSION_ALGORITHM } from './bl-jwt.class';
import { BlJwtAsymmetricService } from './bl-jwt-asymmetric.service';
import { BlJwtAsymmetricVerifier } from './bl-jwt-asymmetric.verifier';
import { BL_JWT_ASYMMETRIC_ALGORITHM } from './bl-jwt-key.class';
import { blBuildTestAsymmetricServices, blGenerateTestSigningKey } from './bl-jwt-key.mock';
import { BlTestAuthorizationServer } from './bl-mcp-token.mock';

const CURRENT = blGenerateTestSigningKey();
const PREVIOUS = blGenerateTestSigningKey();
const FOREIGN = blGenerateTestSigningKey();

const USER_ID = 'user-1';
const USER_EMAIL = 'user@example.com';
const RESOURCE = 'https://api.example.com/mcp/community-doc';
const ONE_HOUR = 3600;

/** The Authorization Server side: a verifier over the keys this application signs with. */
function localVerifier(options: { rotating?: boolean } = {}): {
  service: BlJwtAsymmetricService;
  verifier: BlJwtAsymmetricVerifier;
} {
  return blBuildTestAsymmetricServices({
    privateKeyBase64: CURRENT.privateKeyBase64,
    previousPrivateKeyBase64: options.rotating ? PREVIOUS.privateKeyBase64 : undefined,
  });
}

/**
 * A token signed by an arbitrary key, optionally claiming a `kid` it has no right to.
 * Stands in for anything minted outside this application.
 */
function foreignToken(privateKeyPem: string, kid?: string): string {
  return jwt.sign({ sub: USER_ID, email: USER_EMAIL }, privateKeyPem, {
    algorithm: BL_JWT_ASYMMETRIC_ALGORITHM,
    // Omitted rather than passed as undefined: `jsonwebtoken` rejects an explicit
    // undefined `keyid`, and a token with no `kid` at all is what this stands in for.
    ...(kid == null ? {} : { keyid: kid }),
    audience: RESOURCE,
    expiresIn: ONE_HOUR,
  });
}

describe('BlJwtAsymmetricVerifier', () => {
  describe('accepts', () => {
    it('a token signed by the previous key, so a rotation does not invalidate live tokens', async () => {
      const token = localVerifier().service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR);

      // Same key promoted to `previous`, a new one signing — i.e. the deployment that
      // performs the rotation, verifying a token minted by the one before it.
      const afterRotation = blBuildTestAsymmetricServices({
        privateKeyBase64: PREVIOUS.privateKeyBase64,
        previousPrivateKeyBase64: CURRENT.privateKeyBase64,
      }).verifier;

      expect((await afterRotation.verifyToken(token)).sub).toBe(USER_ID);
    });
  });

  describe('rejects', () => {
    it('a token signed symmetrically with the published public key as the secret', async () => {
      // The algorithm-confusion attack the published key set makes possible: the public
      // key is fetchable by anyone, and a verifier that accepted HS256 as well as RS256
      // would treat it as a shared secret and mint-by-verification.
      const { service, verifier } = localVerifier();
      const authorizationServer = BlTestAuthorizationServer.generate();
      const forged = jwt.sign(
        { sub: USER_ID, email: USER_EMAIL, aud: RESOURCE },
        authorizationServer.publicKeyPem,
        {
          algorithm: BL_JWT_SESSION_ALGORITHM,
          keyid: service.getJwks().keys[0].kid,
          expiresIn: ONE_HOUR,
        }
      );

      await expect(verifier.verifyToken(forged)).rejects.toThrow(jwt.JsonWebTokenError);
    });

    it('an unsigned token claiming alg none', async () => {
      const { service, verifier } = localVerifier();
      const unsigned = jwt.sign({ sub: USER_ID, email: USER_EMAIL, aud: RESOURCE }, null, {
        algorithm: 'none',
        keyid: service.getJwks().keys[0].kid,
      });

      await expect(verifier.verifyToken(unsigned)).rejects.toThrow(jwt.JsonWebTokenError);
    });

    it('a token signed by a key it does not hold, even under a key identifier it does', async () => {
      const { service, verifier } = localVerifier();

      // The `kid` selects; the signature authorizes. Claiming a known key identifier must
      // not be enough on its own.
      const token = foreignToken(FOREIGN.privateKeyPem, service.getJwks().keys[0].kid);

      await expect(verifier.verifyToken(token)).rejects.toThrow(jwt.JsonWebTokenError);
    });

    it('a token naming a key identifier it does not hold', async () => {
      await expect(
        localVerifier().verifier.verifyToken(foreignToken(FOREIGN.privateKeyPem, 'some-other-key'))
      ).rejects.toThrow(/unknown signing key/);
    });

    it('a token naming no key at all, rather than trying the only one', async () => {
      await expect(localVerifier().verifier.verifyToken(foreignToken(CURRENT.privateKeyPem))).rejects.toThrow(
        /names no signing key/
      );
    });

    it('a token signed by the previous key once it is no longer published', async () => {
      const token = blBuildTestAsymmetricServices({
        privateKeyBase64: PREVIOUS.privateKeyBase64,
      }).service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR);

      await expect(localVerifier().verifier.verifyToken(token)).rejects.toThrow(jwt.JsonWebTokenError);
    });

    it('an expired token', async () => {
      const { service, verifier } = localVerifier();

      await expect(
        verifier.verifyToken(service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, -1))
      ).rejects.toThrow(jwt.TokenExpiredError);
    });

    it('a token that is not a JWT at all', async () => {
      await expect(localVerifier().verifier.verifyToken('not-a-token')).rejects.toThrow(
        jwt.JsonWebTokenError
      );
    });
  });

  describe('does not check the audience', () => {
    it('returns the payload for a resource other than the caller is serving', async () => {
      // Deliberate: only the caller knows which resource it is, and `BlResourceGuard`
      // is what compares. A verifier silently accepting any audience is fine; a guard
      // forgetting to compare is not, which is why that lives in one place.
      const { service, verifier } = localVerifier();
      const other = 'https://api.example.com/mcp/space-doc';

      const payload = await verifier.verifyToken(
        service.generateTokenForAudience(USER_ID, USER_EMAIL, other, ONE_HOUR)
      );

      expect(payload.aud).toBe(other);
    });
  });

  /**
   * The Resource Server side: the same verifier, over keys that came from a published
   * document rather than from configuration. The point is that nothing above changes —
   * a token from another application is accepted or refused for the same reasons.
   */
  describe('over a published key set', () => {
    const authorizationServer = BlTestAuthorizationServer.generate();
    const verifier = new BlJwtAsymmetricVerifier(authorizationServer.keySource());

    it('accepts a token minted by the application that published the keys', async () => {
      const payload = await verifier.verifyToken(
        authorizationServer.mintMcpAccessToken({ audience: RESOURCE })
      );

      expect(payload.sub).toBe('test-user');
      expect(payload.aud).toBe(RESOURCE);
    });

    it('refuses a token forged with the published key as an HMAC secret', async () => {
      const forged = authorizationServer.mintMcpAccessToken({ audience: RESOURCE, algorithm: 'HS256' });

      await expect(verifier.verifyToken(forged)).rejects.toThrow(jwt.JsonWebTokenError);
    });

    it('refuses a token naming a key the document does not carry', async () => {
      const token = authorizationServer.mintMcpAccessToken({ audience: RESOURCE, kid: 'not-published' });

      await expect(verifier.verifyToken(token)).rejects.toThrow(/unknown signing key/);
    });

    it('refuses an expired token', async () => {
      const token = authorizationServer.mintMcpAccessToken({ audience: RESOURCE, expiresInSeconds: -1 });

      await expect(verifier.verifyToken(token)).rejects.toThrow(jwt.TokenExpiredError);
    });
  });
});
