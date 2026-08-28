import { generateKeyPairSync } from 'node:crypto';

import { BlJwtAsymmetricService } from './bl-jwt-asymmetric.service';
import { BlJwtAsymmetricVerifier } from './bl-jwt-asymmetric.verifier';
import { BlJwtAsymmetricConfig } from './bl-jwt-key.class';
import { BlJwtKeyStore } from './bl-jwt-key.store';

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

/**
 * The two services the Authorization Server holds over one configured key set: the one that
 * mints and the one that verifies, both reading the same `BlJwtKeyStore`.
 *
 * Here rather than in each spec because both the service spec and the verifier spec need
 * exactly this, and two identical local builders under two different names is one thing
 * wearing two hats. What a *Resource Server* holds instead — the same verifier over a
 * published key set — is `BlTestAuthorizationServer.keySource()` in `bl-mcp-token.mock.ts`.
 */
export function blBuildTestAsymmetricServices(config: BlJwtAsymmetricConfig): {
  service: BlJwtAsymmetricService;
  verifier: BlJwtAsymmetricVerifier;
} {
  const keyStore = new BlJwtKeyStore(config);
  return {
    service: new BlJwtAsymmetricService(keyStore),
    verifier: new BlJwtAsymmetricVerifier(keyStore),
  };
}
