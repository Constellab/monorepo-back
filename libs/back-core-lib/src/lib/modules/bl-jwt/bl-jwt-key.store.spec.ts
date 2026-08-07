import { BlJwtAsymmetricConfig } from './bl-jwt-key.class';
import { blGenerateTestSigningKey } from './bl-jwt-key.mock';
import { BlJwtKeyStore } from './bl-jwt-key.store';
import { BlJwtKeyError, blKeyId, blLoadSigningKey } from './bl-jwt-key.util';

const CURRENT = blGenerateTestSigningKey();
const PREVIOUS = blGenerateTestSigningKey();

const kidOf = (base64Key: string): string => blLoadSigningKey(base64Key, 'spec').kid;

const buildStore = (config: Partial<BlJwtAsymmetricConfig> = {}): BlJwtKeyStore =>
  new BlJwtKeyStore({ privateKeyBase64: CURRENT.privateKeyBase64, ...config });

describe('BlJwtKeyStore', () => {
  describe('without a rotation in progress', () => {
    it('signs with the configured key and publishes only it', () => {
      const store = buildStore();

      expect(store.signingKey.kid).toBe(kidOf(CURRENT.privateKeyBase64));
      expect(store.jwks.keys.map((key) => key.kid)).toEqual([kidOf(CURRENT.privateKeyBase64)]);
    });

    it('treats a blank previous key as absent rather than as a key to load', () => {
      // An operator finishing a rotation is as likely to blank the value as to delete the
      // line, and blanking it must not fail startup.
      expect(buildStore({ previousPrivateKeyBase64: '' }).jwks.keys).toHaveLength(1);
      expect(buildStore({ previousPrivateKeyBase64: '   ' }).jwks.keys).toHaveLength(1);
    });
  });

  describe('during a rotation', () => {
    const store = (): BlJwtKeyStore => buildStore({ previousPrivateKeyBase64: PREVIOUS.privateKeyBase64 });

    it('publishes both keys, the signing one first', () => {
      expect(store().jwks.keys.map((key) => key.kid)).toEqual([
        kidOf(CURRENT.privateKeyBase64),
        kidOf(PREVIOUS.privateKeyBase64),
      ]);
    });

    it('still signs with the current key only', () => {
      expect(store().signingKey.kid).toBe(kidOf(CURRENT.privateKeyBase64));
    });

    it('accepts either key for verification, so live tokens survive the rotation', () => {
      const rotating = store();

      expect(rotating.publicKeyFor(kidOf(CURRENT.privateKeyBase64))).not.toBeNull();
      expect(rotating.publicKeyFor(kidOf(PREVIOUS.privateKeyBase64))).not.toBeNull();
    });

    it('resolves each key identifier to that key and not to the other', () => {
      const rotating = store();
      const resolved = rotating.publicKeyFor(kidOf(PREVIOUS.privateKeyBase64));

      expect(resolved).not.toBeNull();
      expect(blKeyId(resolved!)).toBe(kidOf(PREVIOUS.privateKeyBase64));
    });
  });

  describe('key resolution', () => {
    it('resolves nothing for a key it does not publish', () => {
      const foreign = blGenerateTestSigningKey();

      expect(buildStore().publicKeyFor(kidOf(foreign.privateKeyBase64))).toBeNull();
    });

    it('resolves nothing when a token names no key, rather than falling back', () => {
      // Every token minted here carries a `kid`, so an absent one means the token came
      // from somewhere else. Defaulting to the current key would accept it.
      expect(buildStore().publicKeyFor(undefined)).toBeNull();
    });
  });

  describe('fails at construction', () => {
    it('when the signing key is absent', () => {
      expect(() => new BlJwtKeyStore({ privateKeyBase64: '' })).toThrow(BlJwtKeyError);
    });

    it('when the signing key is malformed', () => {
      expect(() => new BlJwtKeyStore({ privateKeyBase64: 'not-a-key' })).toThrow(BlJwtKeyError);
    });

    it('when the previous key is malformed', () => {
      expect(() => buildStore({ previousPrivateKeyBase64: 'not-a-key' })).toThrow(BlJwtKeyError);
    });

    it('when the previous key repeats the current one', () => {
      // Not merely redundant: it means someone believes a rotation is under way when the
      // key was never replaced, so retiring the "previous" one later invalidates every
      // live token at once.
      expect(() => buildStore({ previousPrivateKeyBase64: CURRENT.privateKeyBase64 })).toThrow(BlJwtKeyError);
    });
  });
});
