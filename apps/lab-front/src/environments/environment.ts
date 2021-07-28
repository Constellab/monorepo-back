import {Environment} from './environment.class';
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/**
 * File for local environment,
 *
 * NEVER IMPORT ENVIRONMENT DIRECTLY FORM HERE, USE ENVIRONMENT HELPER INSTEAD
 */
// const apiBaseUrl: string = 'http://localhost:3000/';
const apiBaseUrl: string = 'https://glab-prod.tokyo.gencovery.io/';
export const environment: Environment = {
  production: false,
  settings: {
    apiBaseUrl: apiBaseUrl,
    devApiBaseUrl: 'https://glab-dev.tokyo.gencovery.io/',
    codeServerUrl: 'https://vlab.tokyo.gencovery.io/',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
