/**
 * Interface for environment,
 */
export interface LabEnvironment {
  // true if the app is compiled in prod mode
  production: boolean;

  settings: LabEnvironmentSettings;
}

/**
 * Environment information that are dynamically loaded form a json
 * file in the asset in prod mode
 */
export interface LabEnvironmentSettings {
  // base url for the api
  apiBaseUrl: string;

  // base url for the api in dev environment
  devApiBaseUrl: string;

  // url for the codelab
  codelabUrl: string;

  // domain name of the server
  virtualHost: string;

  // url of the space front
  spaceFrontUrl: string;

  // url of the space api
  spaceApiUrl: string;

  // url of the community front
  communityFrontUrl: string;

  // url of the community api
  communityApiUrl: string;
}

// Path of the environment json file created during the docker run (used in production)
export const labEnvironmentPath: string = 'assets/environment.json';
