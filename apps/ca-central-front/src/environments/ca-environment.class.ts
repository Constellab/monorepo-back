/**
 * Interface for environment,
 */
export interface CaEnvironment {
  // true if the app is compiled in prod mode
  production: boolean;

  settings: CaEnvironmentSettings;
}

/**
 * Environment information that are dynamically loaded form a json
 * file in the asset in prod mode
 */
export interface CaEnvironmentSettings {
  // base url for the api
  apiUrl: string;

  // base url for the hub api
  communityApiUrl: string;

  // url for the hub
  communityFrontUrl: string;

  // domain name of the server
  frontDomain: string;

}

// Path of the environment json file created during the docker run (used in production)
export const caEnvironmentPath: string = 'assets/environment.json';
