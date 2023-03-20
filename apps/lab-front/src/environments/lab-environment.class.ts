/**
 * Interface for environment,
 */
export interface Environment {
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

  // url for the jupyter lab
  codeServerUrl: string;

  // domain name of the server
  virtualHost: string;

  // url of the space front
  spaceFrontUrl: string;

  // url of the space api
  spaceApiUrl: string;

  // url of the hub front
  hubFrontUrl: string;
}

// Path of the environment json file created during the docker run (used in production)
export const labEnvironmentPath: string = 'assets/environment.json';
