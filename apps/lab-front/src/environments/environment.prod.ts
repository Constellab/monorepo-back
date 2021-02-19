import {Environment} from './environment.class';

const apiBaseUrl: string = 'https://lab.benj.gencovery.io/';
export const environment: Environment = {
  production: true,
  apiBaseUrl: apiBaseUrl,
  apiUrl: `${apiBaseUrl}core-api/`,
};
