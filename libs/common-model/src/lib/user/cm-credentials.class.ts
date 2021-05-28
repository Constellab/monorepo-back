
/**
 * Object to send to log in
 */
export interface CmCredentials {
  email: string;
  password: string;
}

/**
 * Object containing the expiration of a token
 */
export interface CmTokenExpiration{
  expiresIn: number;
}
