import {InjectionToken} from '@angular/core';

/**
 * App configuration
 */
export interface AppConfig {
  /**
   * The api url used by the app. Every call will use this URL
   */
  apiUrl: string;

  /**
   * Absolute route for the front login page
   *
   * This user is automatically redirect to this route when his access is forbidden
   * by the API (expired or wrong token).
   */
  loginRoute: string;

  /**
   * Default duration (in milliseconds) for the snackbar when showing an API error
   *
   * If not provided, default is 5000 milliseconds
   */
  defaultApiErrorDuration?: number;

}

/**
 * Default configuration for App config
 *
 */
export const defaultAppConfig: AppConfig = {
  apiUrl: null,
  loginRoute: null,
  defaultApiErrorDuration: 5000,
};


/**
 * @internal
 * Use to inject the configuration of the module
 *
 * Use '@Inject(APP_CONFIG)' to inject it in component or service
 */
export const APP_CONFIG =
  new InjectionToken<AppConfig>('APP_CONFIG');

