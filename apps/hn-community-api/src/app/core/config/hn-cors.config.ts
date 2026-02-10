import { blGetCorsConfig } from '@monorepo/back-core-lib';

import { HN_ENVIRONMENT_PROFILE_KEY, HnEnvironmentProfile } from '../model/config/hn-config.class';

const env: HnEnvironmentProfile = process.env[HN_ENVIRONMENT_PROFILE_KEY] as HnEnvironmentProfile;
const isLocal = env === 'dev' || env === 'docker' || env === 'test';
export const hnCorsConfig = blGetCorsConfig(
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
