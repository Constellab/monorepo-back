import { generateKeyPairSync } from 'node:crypto';

/**
 * A throwaway RSA key pair as the asymmetric configuration takes it — base64-encoded PEM.
 *
 * Generated per run rather than fixed, so the specs assert on properties that hold for any
 * key rather than on one blessed key's values: a hard-coded thumbprint, for instance, would
 * keep passing if `blKeyId` stopped depending on the key at all.
 *
 * 2048 bits because that is what production uses; a smaller key would let a spec pass on a
 * key size the loader is entitled to refuse later.
 */
export function blGenerateTestSigningKey(): { privateKeyBase64: string; privateKeyPem: string } {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  return {
    privateKeyPem,
    privateKeyBase64: Buffer.from(privateKeyPem).toString('base64'),
  };
}
