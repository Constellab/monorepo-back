import { createPublicKey } from 'node:crypto';

import * as jwt from 'jsonwebtoken';

import { BlJwtAsymmetricService } from './bl-jwt-asymmetric.service';
import { BlJwtAsymmetricVerifier } from './bl-jwt-asymmetric.verifier';
import { BL_JWT_ASYMMETRIC_ALGORITHM, BlJwk } from './bl-jwt-key.class';
import { blBuildTestAsymmetricServices, blGenerateTestSigningKey } from './bl-jwt-key.mock';

const CURRENT = blGenerateTestSigningKey();
const PREVIOUS = blGenerateTestSigningKey();

const USER_ID = 'user-1';
const USER_EMAIL = 'user@example.com';
const RESOURCE = 'https://api.example.com/mcp/community-doc';
const ONE_HOUR = 3600;

/**
 * The minting service and a verifier over the same keys — i.e. the Authorization Server,
 * which verifies against what it holds rather than against its own published document.
 * What a Resource Server does instead is `bl-jwt-asymmetric.verifier.spec.ts`.
 */
function buildAuthorizationServer(options: { rotating?: boolean } = {}): {
  service: BlJwtAsymmetricService;
  verifier: BlJwtAsymmetricVerifier;
} {
  return blBuildTestAsymmetricServices({
    privateKeyBase64: CURRENT.privateKeyBase64,
    previousPrivateKeyBase64: options.rotating ? PREVIOUS.privateKeyBase64 : undefined,
  });
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
 * The published public key, in the PEM form anyone can rebuild from the key set — which
 * is precisely what an attacker attempting algorithm confusion has to work with.
 */
function publishedPublicKeyPem(jwk: BlJwk): string {
  return createPublicKey({ key: jwk, format: 'jwk' }).export({ type: 'spki', format: 'pem' }).toString();
}

describe('BlJwtAsymmetricService', () => {
  describe('generateTokenForAudience', () => {
    it('mints a token a verifier reads back, carrying the user and the resource', async () => {
      const { service, verifier } = buildAuthorizationServer();

      const payload = await verifier.verifyToken(
        service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR)
      );

      expect(payload.sub).toBe(USER_ID);
      expect(payload.email).toBe(USER_EMAIL);
      expect(payload.aud).toBe(RESOURCE);
    });

    it('signs asymmetrically and names the key that signed it', () => {
      const { service } = buildAuthorizationServer();

      const header = headerOf(service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR));

      expect(header.alg).toBe(BL_JWT_ASYMMETRIC_ALGORITHM);
      // Present from the outset, so a rotation is a configuration change rather than a
      // change to the token format.
      expect(header.kid).toBe(service.getJwks().keys[0].kid);
    });

    it('honours the lifetime it is given', async () => {
      const { service, verifier } = buildAuthorizationServer();

      const payload = await verifier.verifyToken(
        service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR)
      );

      expect(payload.exp! - payload.iat!).toBe(ONE_HOUR);
    });

    it('signs with the current key even while the previous one is still published', () => {
      const { service } = buildAuthorizationServer({ rotating: true });

      const header = headerOf(service.generateTokenForAudience(USER_ID, USER_EMAIL, RESOURCE, ONE_HOUR));

      expect(header.kid).toBe(service.getJwks().keys[0].kid);
      expect(header.kid).not.toBe(service.getJwks().keys[1].kid);
    });
  });

  describe('mints and verifies are separate capabilities', () => {
    it('exposes no way to verify from the minting service', () => {
      // Not tidiness: a Resource Server mounts the verifier and never this class, so the
      // day one of them grows the other's method is the day "holds no ability to mint"
      // stops being enforced by the injector.
      expect(
        (buildAuthorizationServer().service as unknown as Record<string, unknown>).verifyToken
      ).toBeUndefined();
    });
  });

  describe('getJwks', () => {
    it('publishes the key set the store holds', () => {
      expect(buildAuthorizationServer().service.getJwks().keys).toHaveLength(1);
      expect(buildAuthorizationServer({ rotating: true }).service.getJwks().keys).toHaveLength(2);
    });

    it('publishes enough to verify a token and nothing more', () => {
      const { service } = buildAuthorizationServer();
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
