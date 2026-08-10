import { createHash, createPrivateKey, createPublicKey, KeyObject } from 'node:crypto';

import { BL_JWT_ASYMMETRIC_ALGORITHM, BlJwk, BlJwks, BlJwtKeyPair } from './bl-jwt-key.class';

/**
 * Raised when configured key material cannot be turned into a usable signing key.
 *
 * Its own type so the loading path can be asserted on precisely, and its message always
 * names the configuration entry at fault: the whole point of failing here is that an
 * operator reads which value to fix, rather than discovering it later as tokens being
 * silently rejected.
 */
export class BlJwtKeyError extends Error {
  constructor(configName: string, reason: string) {
    super(`Invalid JWT signing key in '${configName}': ${reason}`);
    this.name = 'BlJwtKeyError';
  }
}

/**
 * Load a base64-encoded PEM private key and derive everything else from it.
 *
 * The public half is derived rather than configured separately: configuring both invites
 * a mismatched pair, which presents as every token failing verification with nothing
 * pointing at the cause.
 *
 * Throws {@link BlJwtKeyError} on anything unusable — absent, not base64, not a PEM
 * private key, or not RSA. Callers are expected to let that reach startup.
 */
export function blLoadSigningKey(base64Key: string | undefined, configName: string): BlJwtKeyPair {
  if (base64Key == null || base64Key.trim().length === 0) {
    throw new BlJwtKeyError(configName, 'no value configured');
  }

  const pem = Buffer.from(base64Key.trim(), 'base64').toString('utf8');
  // Buffer.from(…, 'base64') never throws — it discards what it cannot decode — so a
  // value that is not base64 at all only shows up as a PEM that makes no sense. Check
  // for the header explicitly to tell "not base64" apart from "wrong kind of key".
  if (!pem.includes('-----BEGIN')) {
    throw new BlJwtKeyError(configName, 'value does not base64-decode to a PEM block');
  }

  let privateKey: KeyObject;
  try {
    privateKey = createPrivateKey(pem);
  } catch (error) {
    throw new BlJwtKeyError(configName, (error as Error).message);
  }

  if (privateKey.asymmetricKeyType !== 'rsa') {
    throw new BlJwtKeyError(
      configName,
      `expected an RSA key for ${BL_JWT_ASYMMETRIC_ALGORITHM}, got '${privateKey.asymmetricKeyType}'`
    );
  }

  // Derived from the PEM rather than from the KeyObject: `createPublicKey` accepts either,
  // but @types/node no longer declares the KeyObject overload.
  const publicKey = createPublicKey(pem);
  return { kid: blKeyId(publicKey), privateKey, publicKey };
}

/**
 * Represent a public key as the JWK the key set publishes.
 *
 * `use` and `alg` are stated rather than left out: they are what tells a verifier this
 * key is for signatures and for exactly one algorithm, which is the same pinning the
 * verification paths apply locally.
 */
export function blPublicJwk(publicKey: KeyObject): BlJwk {
  const components = blRsaComponents(publicKey);
  return {
    kty: 'RSA',
    use: 'sig',
    alg: BL_JWT_ASYMMETRIC_ALGORITHM,
    kid: blThumbprint(components),
    ...components,
  };
}

/**
 * Turn one entry of a published key set back into a usable public key, or null when the
 * entry is not one this platform verifies with.
 *
 * The filter is the point, not the conversion. A key set is fetched over the network from
 * another application, so every member of an entry is untrusted until checked: an entry
 * offering another algorithm, another key type, or a key for encryption rather than
 * signatures must not become something a signature is checked against. `kid` is required
 * for the same reason it is on the minting side — a key nobody can name is a key no token
 * can select.
 *
 * Returns null rather than throwing: one unusable entry in a document must not cost the
 * usable ones next to it, which is what a rotation to a future algorithm would look like.
 */
export function blPublicKeyFromJwk(jwk: BlJwk): KeyObject | null {
  if (jwk?.kty !== 'RSA' || jwk.alg !== BL_JWT_ASYMMETRIC_ALGORITHM || jwk.use !== 'sig') {
    return null;
  }
  if (typeof jwk.kid !== 'string' || jwk.kid.length === 0 || jwk.n == null || jwk.e == null) {
    return null;
  }

  try {
    // Rebuilt from `n` and `e` alone: whatever else the document carried is discarded
    // here rather than trusted, so a member added to an entry cannot reach the key.
    return createPublicKey({ key: { kty: 'RSA', n: jwk.n, e: jwk.e }, format: 'jwk' });
  } catch {
    return null;
  }
}

/**
 * JWK Set document for the given keys, in the order handed in — current key first, so a
 * verifier that ignores `kid` and tries keys in order still hits the likely one first.
 */
export function blBuildJwks(keyPairs: BlJwtKeyPair[]): BlJwks {
  return { keys: keyPairs.map((keyPair) => blPublicJwk(keyPair.publicKey)) };
}

/**
 * RFC 7638 JWK thumbprint of a public key — the `kid` it is published and selected under.
 */
export function blKeyId(publicKey: KeyObject): string {
  return blThumbprint(blRsaComponents(publicKey));
}

/**
 * RFC 7638 JWK thumbprint: SHA-256 over the required members only, in lexicographic
 * order, with no whitespace. Stable across encodings of the same key, which is what
 * makes it safe to use as a `kid` two applications must agree on without coordinating.
 */
function blThumbprint({ n, e }: { n: string; e: string }): string {
  const canonical = JSON.stringify({ e, kty: 'RSA', n });
  return createHash('sha256').update(canonical).digest('base64url');
}

/** The two members of an RSA public JWK, as Node exports them. */
function blRsaComponents(publicKey: KeyObject): { n: string; e: string } {
  const jwk = publicKey.export({ format: 'jwk' }) as { kty?: string; n?: string; e?: string };
  if (jwk.kty !== 'RSA' || jwk.n == null || jwk.e == null) {
    throw new Error(`Expected an RSA public key, got '${jwk.kty ?? 'unknown'}'`);
  }
  return { n: jwk.n, e: jwk.e };
}
