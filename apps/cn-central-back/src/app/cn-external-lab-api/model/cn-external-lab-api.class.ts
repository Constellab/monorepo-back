import {ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';

/**
 * Response when logged in a user to the lab instance
 */
export interface CnExternalLabLoginResponse {
  temp_token: string;
}

export type CnExternalLabUserRole = 'ADMIN' | 'USER';

export interface CnExternalLabUser {
  id: string;
  email: string;
  group: CnExternalLabUserRole;
  is_active: boolean;
  first_name: string;
  last_name: string;
  theme: ClTheme;
  lang: ClSupportedLanguage;
  photo: string;
}


/**
 * Object that represent the current global activity of a lab
 */
export interface CnLabGlobalActivity {
  running_experiments: number;
  queued_experiments: number;
  last_activity: {
    created_at: string;
  };
  dev_env_running: boolean;
}
