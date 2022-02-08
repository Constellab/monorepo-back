/**
 * Response when logged in a user to the lab instance
 */

export interface CnExternalLabLoginResponse {
  temp_token: string;
}

export type CnExternalLabUserGroup = 'ADMIN' | 'USER';

export interface CnExternalLabUser {
  id: string;
  email: string;
  group: CnExternalLabUserGroup;
  is_active: boolean;
  is_admin: boolean;
  first_name: string;
  last_name: string;
}

export interface CnExternalNewLabUser {
  userId: string;
  group: CnExternalLabUserGroup;
}
