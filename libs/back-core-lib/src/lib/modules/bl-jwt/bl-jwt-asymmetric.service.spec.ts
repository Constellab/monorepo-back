import { createPublicKey } from 'node:crypto';

import * as jwt from 'jsonwebtoken';

import { BL_JWT_SESSION_ALGORITHM } from './bl-jwt.class';
import { BlJwtAsymmetricService } from './bl-jwt-asymmetric.service';
import { BL_JWT_ASYMMETRIC_ALGORITHM, BlJwk } from './bl-jwt-key.class';
import { blGenerateTestSigningKey } from './bl-jwt-key.mock';
import { BlJwtKeyStore } from './bl-jwt-key.store';

const CURRENT = blGenerateTestSigningKey();
const PREVIOUS = blGenerateTestSigningKey();
const FOREIGN = blGenerateTestSigningKey();

const USER_ID = 'user-1';
const USER_EMAIL = 'user@example.com';
const RESOURCE = 'https://api.example.com/mcp/community-doc';
const ONE_HOUR = 3600;

function buildService(options: { rotating?: boolean } = {}): BlJwtAsymmetricService {
  return new BlJwtAsymmetricService(
    new BlJwtKeyStore({
      privateKeyBase64: CURRENT.privateKeyBase64,
      previousPrivateKeyBase64: options.rotating ? PREVIOUS.privateKeyBase64 : undefined,
    })
  );
}

/** Decoded header of a token, without verifying it. */
function headerOf(token: string): jwt.JwtHeader {
  const decoded = jwt.decode(token, { complete: true });
  if (decoded == null) {
    throw new Error('token is not a JWT');
  }
  return decoded.header;
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

/**
 * The published public key, in the PEM form anyone can rebuild from the key set — which
 * is precisely what an attacker attempting algorithm confusion has to work with.
 */
function publishedPublicKeyPem(jwk: BlJwk): string {
  return createPublicKey({ key: jwk, format: 'jwk' }).export({ type: 'spki', format: 'pem' }).toString();
}

describe('BlJwtAsymmetricService', () => {
  describe('generateTokenForAudience', () => {
    it('mints a token the service verifies back, carrying the user and the resource', () => {
      const service = buildService();

      const payload = service.verifyToken(
        service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR)
      );

      expect(payload.sub).toBe(USER_ID);
      expect(payload.email).toBe(USER_EMAIL);
      expect(payload.aud).toBe(RESOURCE);
    });

    it('signs asymmetrically and names the key that signed it', () => {
      const service = buildService();

      const header = headerOf(service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR));

      expect(header.alg).toBe(BL_JWT_ASYMMETRIC_ALGORITHM);
      // Present from the outset, so a rotation is a configuration change rather than a
      // change to the token format.
      expect(header.kid).toBe(service.getJwks().keys[0].kid);
    });

    it('honours the lifetime it is given', () => {
      const service = buildService();

      const payload = service.verifyToken(
        service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR)
      );

      expect(payload.exp! - payload.iat!).toBe(ONE_HOUR);
    });

    it('signs with the current key even while the previous one is still published', () => {
      const service = buildService({ rotating: true });

      const header = headerOf(service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR));

      expect(header.kid).toBe(service.getJwks().keys[0].kid);
      expect(header.kid).not.toBe(service.getJwks().keys[1].kid);
    });
  });

  describe('verifyToken accepts', () => {
    it('a token signed by the previous key, so a rotation does not invalidate live tokens', () => {
      const beforeRotation = buildService();
      const token = beforeRotation.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR);

      // Same key promoted to `previous`, a new one signing — i.e. the deployment that
      // performs the rotation, verifying a token minted by the one before it.
      const afterRotation = new BlJwtAsymmetricService(
        new BlJwtKeyStore({
          privateKeyBase64: PREVIOUS.privateKeyBase64,
          previousPrivateKeyBase64: CURRENT.privateKeyBase64,
        })
      );

      expect(afterRotation.verifyToken(token).sub).toBe(USER_ID);
    });
  });

  describe('verifyToken rejects', () => {
    it('a token signed symmetrically with the published public key as the secret', () => {
      // The algorithm-confusion attack the published key set makes possible: the public
      // key is fetchable by anyone, and a verifier that accepted HS256 as well as RS256
      // would treat it as a shared secret and mint-by-verification.
      const service = buildService();
      const secret = publishedPublicKeyPem(service.getJwks().keys[0]);

      const forged = jwt.sign({ sub: USER_ID, email: USER_EMAIL, aud: RESOURCE }, secret, {
        algorithm: BL_JWT_SESSION_ALGORITHM,
        keyid: service.getJwks().keys[0].kid,
        expiresIn: ONE_HOUR,
      });

      expect(() => service.verifyToken(forged)).toThrow(jwt.JsonWebTokenError);
    });

    it('an unsigned token claiming alg none', () => {
      const service = buildService();
      const unsigned = jwt.sign({ sub: USER_ID, email: USER_EMAIL, aud: RESOURCE }, null, {
        algorithm: 'none',
        keyid: service.getJwks().keys[0].kid,
      });

      expect(() => service.verifyToken(unsigned)).toThrow(jwt.JsonWebTokenError);
    });

    it('a token signed by a key it does not publish, even under a key identifier it does', () => {
      const service = buildService();

      // The `kid` selects; the signature authorizes. Claiming a published key identifier
      // must not be enough on its own.
      const token = foreignToken(FOREIGN.privateKeyPem, service.getJwks().keys[0].kid);

      expect(() => service.verifyToken(token)).toThrow(jwt.JsonWebTokenError);
    });

    it('a token naming a key identifier that is not published', () => {
      const service = buildService();

      expect(() => service.verifyToken(foreignToken(FOREIGN.privateKeyPem, 'some-other-key'))).toThrow(
        /unknown signing key/
      );
    });

    it('a token naming no key at all, rather than trying the current one', () => {
      const service = buildService();

      expect(() => service.verifyToken(foreignToken(CURRENT.privateKeyPem))).toThrow(/names no signing key/);
    });

    it('a token signed by the previous key once it is no longer published', () => {
      const rotated = buildService();
      const token = new BlJwtAsymmetricService(
        new BlJwtKeyStore({ privateKeyBase64: PREVIOUS.privateKeyBase64 })
      ).generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR);

      expect(() => rotated.verifyToken(token)).toThrow(jwt.JsonWebTokenError);
    });

    it('an expired token', () => {
      const service = buildService();

      expect(() =>
        service.verifyToken(service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, -1))
      ).toThrow(jwt.TokenExpiredError);
    });

    it('a token that is not a JWT at all', () => {
      expect(() => buildService().verifyToken('not-a-token')).toThrow(jwt.JsonWebTokenError);
    });
  });

  describe('verifyToken does not check the audience', () => {
    it('returns the payload for a resource other than the caller is serving', () => {
      // Deliberate: only the caller knows which resource it is, and `HnMcpResourceGuard`
      // is what compares. A verifier silently accepting any audience is fine; a guard
      // forgetting to compare is not, which is why that lives in one place.
      const service = buildService();
      const other = 'https://api.example.com/mcp/space-doc';

      expect(
        service.verifyToken(service.generateTokenForAudience(USER_ID, USER_EMAIL, other, ONE_HOUR)).aud
      ).toBe(other);
    });
  });

  describe('getJwks', () => {
    it('publishes the key set the store holds', () => {
      expect(buildService().getJwks().keys).toHaveLength(1);
      expect(buildService({ rotating: true }).getJwks().keys).toHaveLength(2);
    });

    it('publishes enough to verify a token and nothing more', () => {
      const service = buildService();
      const [jwk] = service.getJwks().keys;

      // Rebuilding the public key from the document and verifying with it is exactly what
      // a Resource Server in another application does.
      const token = service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR);
      const verified = jwt.verify(token, publishedPublicKeyPem(jwk), {
        algorithms: [BL_JWT_ASYMMETRIC_ALGORITHM],
      }) as { sub: string };

      expect(verified.sub).toBe(USER_ID);
    });
  });
});
