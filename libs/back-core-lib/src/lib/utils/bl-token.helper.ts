import jwt = require('jsonwebtoken');

/**
 * Class to encode/decode token manually
 */
export class BlTokenHelper {
  /**
   * Encode a JWT token
   * @param secret jwt secret
   * @param payload info to encode in JWT
   * @param expiresIn token validity in seconds
   */
  public static encodeToken(secret: string, payload: any, expiresIn: number): string {
    return jwt.sign(payload, secret, { expiresIn: expiresIn });
  }

  /**
   * Decode the jwt and verify the expiration
   * @param secret jwt secret
   * @param token token to decode
   */
  public static decodeToken(secret: string, token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          reject(err);
        }
        resolve(decoded);
      });
    });
  }
}
