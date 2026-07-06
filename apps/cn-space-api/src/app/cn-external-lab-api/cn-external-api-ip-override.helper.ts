import { BlExternalApiHttpOption } from '@monorepo/back-core-lib';
import { LookupAddress } from 'dns';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

/**
 * For on-premise labs reachable only on the client network, override the DNS
 * resolution of the lab hostnames to a configured private IP, without changing
 * the request URL. This keeps the hostname intact for TLS/SNI and the Host
 * header, and only redirects where the name resolves (Node's per-request
 * `lookup` hook), replacing a machine-global /etc/hosts override.
 *
 * Mutates and returns the given options. No-op when ipOverride is empty.
 */
export function cnApplyIpOverride(
  ipOverride: string | undefined,
  options: BlExternalApiHttpOption
): BlExternalApiHttpOption {
  if (!ipOverride) {
    return options;
  }

  const ip = ipOverride;

  // Node may call `lookup` with `{ all: true }`, in which case it expects an
  // array of addresses instead of a single (address, family) pair. Support both
  // signatures, otherwise the resolution silently fails and the request never
  // reaches the override IP.
  const lookup = (
    _hostname: string,
    opts: any,
    callback: (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void
  ): void => {
    // always resolve the lab hostname to the configured private IP
    if (opts && opts.all) {
      callback(null, [{ address: ip, family: 4 }]);
    } else {
      callback(null, ip, 4);
    }
  };

  options.httpAgent = new HttpAgent({ lookup });
  options.httpsAgent = new HttpsAgent({ lookup });
  return options;
}
