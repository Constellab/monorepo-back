import {Environment} from './lab-environment.class';

/**
 * This file is just to define the skeleton for prod environment and set production to True
 * The content is overwritten on app load by {@link labLoadEnvironmentFromAssets} that uses a json file
 * in the assets
 *
 * NEVER IMPORT THIS FILE FROM ANOTHER FILE
 */
export const environment: Environment = {
  production: true,
  settings: {
    apiBaseUrl: '',
    devApiBaseUrl: '',
    codeServerUrl: '',
    virtualHost: '',
    centralFrontUrl: '',
  }
};
