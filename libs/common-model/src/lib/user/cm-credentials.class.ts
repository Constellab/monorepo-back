
/**
 * Object to send to log in
 */
export interface CmCredentials {
  email: string;
  password: string;
}

/**
 * Object to send to log in
 */
export interface CmCredentials2Fa {
  twoFAUrlCode: string;
  twoFACode: string;
}
