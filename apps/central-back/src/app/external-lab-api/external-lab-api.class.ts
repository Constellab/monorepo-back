/**
 * Response when logged in a user to the lab instance
 */

export interface ExternalLabLoginResponse {
  access_token: string;
  token_type: string;
}

export type ExternalLabUserGroup = 'ADMIN' | 'USER';

export interface ExternalLabUser {
  id: string;
  email: string;
  group: ExternalLabUserGroup;
  is_active: boolean;
  is_admin: boolean;
  first_name: string;
  last_name: string;
}

export interface ExternalNewLabUser {
  userId: string;
  group: ExternalLabUserGroup;
}
