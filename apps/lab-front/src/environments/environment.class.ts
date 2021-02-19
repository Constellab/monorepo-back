export interface Environment {
  // true if the app is compiled in prod mode
  production: boolean;

  // base url for the api
  apiBaseUrl: string;

  // full url for the api
  apiUrl: string;
}
