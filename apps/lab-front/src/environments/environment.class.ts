/**
 * Interface for environment,
 */
export interface Environment {
  // true if the app is compiled in prod mode
  production: boolean;


  settings: EnvironmentSettings;
}

/**
 * Environment information that are dynamically loaded form a json
 * file in the asset in prod mode
 */
export interface EnvironmentSettings {
  // base url for the api
  apiBaseUrl: string;

  // full url for the api
  apiUrl: string;

  // url for the jupyter lab
  codeServerUrl: string;

}

// Path of the environment json file created during the docker run (used in production)
export const environmentPath: string = 'assets/environment.json';
