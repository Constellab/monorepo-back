export interface Environment {
  // true if the app is compiled in prod mode
  production: boolean;

  // base url for the api
  apiBaseUrl: string;

  // full url for the api
  apiUrl: string;

  // url for the jupyter lab
  jupyterLabUrl: string;

  // url for the central api
  centralApiUrl: string;
}
