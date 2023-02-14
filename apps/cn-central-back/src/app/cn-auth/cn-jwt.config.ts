const tokenDurationInSeconds: number = 60 * 60 * 24 * 2; // duration of the token in seconds, 2 days

export const cnJwtConfig = {
  tokenDurationInSeconds: tokenDurationInSeconds, // duration of the token in seconds
  tokenDurationInMilliseconds: tokenDurationInSeconds * 1000, // duration of the token in milliseconds seconds
  authorizationCookie: 'Authorization', // name of the authorization cookie
  authExpiration: 'Auth_Expiration' // name of the auth expiration cookie
};
