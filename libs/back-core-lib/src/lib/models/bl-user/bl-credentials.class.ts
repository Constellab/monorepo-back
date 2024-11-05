/**
 * Object to send to log in
 */
export interface BlCredentials {
  email: string;
  password: string;
  captcha?: string;
}

/**
 * Object to send to log in
 */
export interface BlCredentials2Fa {
  twoFAUrlCode: string;
  twoFACode: string;
}
