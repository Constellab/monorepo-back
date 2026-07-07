const tokenDurationInSeconds: number = 60 * 60 * 24 * 7; // duration of the token in seconds, 7 days

export const CN_JWT_CONFIG = {
  tokenDurationInSeconds: tokenDurationInSeconds, // duration of the token in seconds
  tokenDurationInMilliseconds: tokenDurationInSeconds * 1000, // duration of the token in milliseconds seconds
  authorizationCookie: 'Authorization', // name of the authorization cookie
  authExpiration: 'Auth_Expiration', // name of the auth expiration cookie
};
