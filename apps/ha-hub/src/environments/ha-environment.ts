// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {HaEnvironment} from './ha-environment.class';

export const environment: HaEnvironment = {
  production: false,
  settings: {
    apiUrl: 'http://localhost:3333',
    constellabApiUrl: 'https://api.preconstellab.com',
    constellabFrontUrl: 'https://preconstellab.com',
    communityFrontUrl: 'http://localhost:4200'
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
