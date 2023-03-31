import {HaEnvironment} from './ha-environment.class';

/**
 * This file is just to define the skeleton for prod environment and set production to True
 * The content is overwritten on app load by {@link flLoadEnvironmentFromAssets} that uses a json file
 * in the assets
 *
 * NEVER IMPORT THIS FILE FROM ANOTHER FILE
 */
export const environment: HaEnvironment = {
  production: true,
  settings: {
    apiUrl: '',
    constellabApiUrl: '',
    constellabFrontUrl: '',
    communityFrontUrl: '',
  }
};

// PREPROD
// apiUrl: 'https://hub-back-pre-prod.constellab-pre-prod.gencovery.com',
// constellabApiUrl: 'https://api.preconstellab.com',
// constellabUrl: 'https://preconstellab.com',
// hubUrl: 'https://hub-pre-prod.gencovery.com',

// PROD
// apiUrl: 'https://api.constellab.community',
// constellabApiUrl: 'https://api.constellab.space',
// constellabUrl: 'https://constellab.space',
// hubUrl: 'https://constellab.community',
