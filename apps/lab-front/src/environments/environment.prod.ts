import {Environment} from './environment.class';

const apiBaseUrl: string = 'https://lab.benj.gencovery.io/';
export const environment: Environment = {
  production: true,
  apiBaseUrl: apiBaseUrl,
  apiUrl: `${apiBaseUrl}core-api/`,
  jupyterLabUrl: 'https://jlab.benj.gencovery.io/' +
    '?token=JSLaMCrFtncD66b4D9kr2Bfod5E5XAT4iaVgtHE3KeER4NPPeLDMVqjL7Qqi6XMDZR7uqGSMcDDXKcLX3b65kPUkdKsXXq24',
  centralApiUrl: 'https://prod-back.gws.gencovery.com/'
};
