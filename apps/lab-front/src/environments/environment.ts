// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {Environment} from './environment.class';

const apiBaseUrl: string = 'http://localhost:3001/';
// const apiBaseUrl: string = 'https://lab.atom.gencovery.io/';
export const environment: Environment = {
  production: false,
  apiBaseUrl: apiBaseUrl,
  apiUrl: `${apiBaseUrl}core-api/`,
  jupyterLabUrl: 'https://jlab.atom.gencovery.io/' +
    '?token=JSLaMCrFtncD66b4D9kr2Bfod5E5XAT4iaVgtHE3KeER4NPPeLDMVqjL7Qqi6XMDZR7uqGSMcDDXKcLX3b65kPUkdKsXXq24'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
