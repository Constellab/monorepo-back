import {CaEnvironment} from './ca-environment.class';

/**
 * This file is just to define the skeleton for prod environment and set production to True
 * The content is overwritten on app load by {@link flLoadEnvironmentFromAssets} that uses a json file
 * in the assets
 *
 * NEVER IMPORT THIS FILE FROM ANOTHER FILE
 */
export const environment: CaEnvironment = {
  production: true,
  settings: {
    apiUrl: '',
    communityApiUrl: '',
    communityFrontUrl: '',
    frontDomain: '',
  }
};

// PREPROD
// apiUrl: 'https://api.preconstellab.com',
// communityApiUrl: 'https://hub-back-pre-prod.constellab-pre-prod.gencovery.com',
// communityFrontUrl: 'https://hub-pre-prod.gencovery.com',
// frontDomain: 'preconstellab.com',

// PROD
// apiUrl: 'https://api.constellab.space',
// communityApiUrl: 'https://hub-back.constellab.gencovery.com',
// communityFrontUrl: 'https://constellab.community',
// frontDomain: 'constellab.space',
