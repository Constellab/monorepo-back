import { blGetCorsConfig } from '@monorepo/back-core-lib';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { HN_ENVIRONMENT_PROFILE_KEY, HnEnvironmentProfile } from '../model/config/hn-config.class';

export function hnCorsConfig(): CorsOptions {
  const env: HnEnvironmentProfile = process.env[HN_ENVIRONMENT_PROFILE_KEY] as HnEnvironmentProfile;
  const isLocal = env === 'dev' || env === 'docker' || env === 'test';
  return blGetCorsConfig(
    [
      'constellab.community',
      'constellab.space',
      'preconstellab.com',
      'gencovery.com',
      'gencovery.io',
      'constellab.app',
    ],
    isLocal
  );
}
