import { createHash, generateKeyPairSync } from 'node:crypto';

import { BL_JWT_ASYMMETRIC_ALGORITHM } from './bl-jwt-key.class';
import { blGenerateTestSigningKey } from './bl-jwt-key.mock';
import { blBuildJwks, BlJwtKeyError, blKeyId, blLoadSigningKey, blPublicJwk } from './bl-jwt-key.util';

const CONFIG_NAME = 'privateKeyBase64';

const base64 = (value: string): string => Buffer.from(value).toString('base64');

describe('blLoadSigningKey', () => {
  it('loads a base64-encoded PEM private key and derives its public half', () => {
    const { privateKeyBase64 } = blGenerateTestSigningKey();

    const key = blLoadSigningKey(privateKeyBase64, CONFIG_NAME);

    expect(key.privateKey.type).toBe('private');
    expect(key.publicKey.type).toBe('public');
    expect(key.kid).toEqual(expect.any(String));
  });

  it('derives the public key from the private one rather than taking it separately', () => {
    // A mismatched pair is unrepresentable: every token would fail verification with
    // nothing pointing at the cause, so there is deliberately no way to configure one.
    const { privateKeyBase64 } = blGenerateTestSigningKey();

    const key = blLoadSigningKey(privateKeyBase64, CONFIG_NAME);

    expect(blKeyId(key.publicKey)).toBe(key.kid);
  });

  it('gives the same key the same identifier every time it is loaded', () => {
    // Two deployments handed the same key must agree on its `kid` without coordinating,
    // which is what makes it safe to select a verification key by it.
    const { privateKeyBase64 } = blGenerateTestSigningKey();

    expect(blLoadSigningKey(privateKeyBase64, CONFIG_NAME).kid).toBe(
      blLoadSigningKey(privateKeyBase64, CONFIG_NAME).kid
    );
  });

  it('gives different keys different identifiers', () => {
    const first = blLoadSigningKey(blGenerateTestSigningKey().privateKeyBase64, CONFIG_NAME);
    const second = blLoadSigningKey(blGenerateTestSigningKey().privateKeyBase64, CONFIG_NAME);

    expect(first.kid).not.toBe(second.kid);
  });

  describe('fails loudly, naming the configuration entry at fault', () => {
    const expectRejected = (value: string | undefined): void => {
      expect(() => blLoadSigningKey(value, CONFIG_NAME)).toThrow(BlJwtKeyError);
      expect(() => blLoadSigningKey(value, CONFIG_NAME)).toThrow(CONFIG_NAME);
    };

    it('on no value at all', () => {
      expectRejected(undefined);
    });

    it('on an empty or blank value', () => {
      expectRejected('');
      expectRejected('   ');
    });

    it('on a value that does not base64-decode to a PEM block', () => {
      expectRejected('not-base64-at-all');
      expectRejected(base64('just some text'));
    });

    it('on a PEM that is a public key rather than a private one', () => {
      const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
      const pem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

      expectRejected(base64(pem));
    });

    it('on a private key of the wrong type for the algorithm', () => {
      const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
      const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();

      expect(() => blLoadSigningKey(base64(pem), CONFIG_NAME)).toThrow(BL_JWT_ASYMMETRIC_ALGORITHM);
    });
  });
});

describe('blKeyId', () => {
  it('is the RFC 7638 thumbprint: SHA-256 over e, kty and n, in that order', () => {
    const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const { n, e } = publicKey.export({ format: 'jwk' }) as { n: string; e: string };

    // Spelled out rather than taken from the implementation: the point of the standard
    // thumbprint is that another application computes the same value from the published
    // JWK alone, so this is the contract and not an internal detail.
    const expected = createHash('sha256')
      .update(JSON.stringify({ e, kty: 'RSA', n }))
      .digest('base64url');

    expect(blKeyId(publicKey)).toBe(expected);
  });
});

describe('blPublicJwk', () => {
  it('describes the key as a signing key for exactly one algorithm', () => {
    const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

    const jwk = blPublicJwk(publicKey);

    expect(jwk.kty).toBe('RSA');
    expect(jwk.use).toBe('sig');
    expect(jwk.alg).toBe(BL_JWT_ASYMMETRIC_ALGORITHM);
    expect(jwk.kid).toBe(blKeyId(publicKey));
    expect(jwk.n.length).toBeGreaterThan(0);
    expect(jwk.e.length).toBeGreaterThan(0);
  });

  it('carries no private member, whatever the key it was handed', () => {
    // This document is published to anyone who asks. A private member leaking into it
    // hands out the ability to mint tokens, which is the one thing publishing keys must
    // never do — so assert on the whole shape, not just on the members we meant to set.
    const { privateKeyBase64 } = blGenerateTestSigningKey();
    const key = blLoadSigningKey(privateKeyBase64, CONFIG_NAME);

    expect(Object.keys(blPublicJwk(key.publicKey)).sort()).toEqual(['alg', 'e', 'kid', 'kty', 'n', 'use']);
  });
});

describe('blBuildJwks', () => {
  it('publishes one JWK per key, in the order handed in', () => {
    const current = blLoadSigningKey(blGenerateTestSigningKey().privateKeyBase64, CONFIG_NAME);
    const previous = blLoadSigningKey(blGenerateTestSigningKey().privateKeyBase64, CONFIG_NAME);

    const jwks = blBuildJwks([current, previous]);

    expect(jwks.keys.map((key) => key.kid)).toEqual([current.kid, previous.kid]);
  });

  it('publishes a single key when there is no rotation in progress', () => {
    const current = blLoadSigningKey(blGenerateTestSigningKey().privateKeyBase64, CONFIG_NAME);

    expect(blBuildJwks([current]).keys).toHaveLength(1);
  });
});
