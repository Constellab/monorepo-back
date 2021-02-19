import {Environment} from './environment.class';

const apiBaseUrl: string = 'https://lab.atom.gencovery.io/';
export const environment: Environment = {
  production: true,
  apiBaseUrl: apiBaseUrl,
  apiUrl: `${apiBaseUrl}core-api/`,
};
