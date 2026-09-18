import { blGetCorsAllowedDomains, blGetCorsConfig } from '@monorepo/back-core-lib';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { hnIsLocalEnvironment } from '../model/config/hn-config.class';

/**
 * The domains allowed to call this API come from the environment
 * (`CORS_ALLOWED_DOMAINS`): each instance is served from its own domain, which nothing
 * in the code could know.
 */
export function hnCorsConfig(): CorsOptions {
  const isLocal: boolean = hnIsLocalEnvironment();
  return blGetCorsConfig(blGetCorsAllowedDomains(isLocal), isLocal);
}
