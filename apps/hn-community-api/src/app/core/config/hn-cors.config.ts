import { blGetCorsConfig } from '@monorepo/back-core-lib';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { hnIsLocalEnvironment } from '../model/config/hn-config.class';

export function hnCorsConfig(): CorsOptions {
  return blGetCorsConfig(
    [
      'constellab.community',
      'constellab.space',
      'preconstellab.com',
      'gencovery.com',
      'gencovery.io',
      'constellab.app',
    ],
    hnIsLocalEnvironment()
  );
}
