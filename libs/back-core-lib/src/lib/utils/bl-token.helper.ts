import * as jwt from 'jsonwebtoken';

import { BL_JWT_SESSION_ALGORITHM } from '../modules/bl-jwt/bl-jwt.class';

/**
 * Class to encode/decode token manually
 *
 * Always symmetric — its argument is a shared secret, never key material — so both
 * methods state that one algorithm. Named rather than left to the library default for the
 * same reason every other verification path here does: a verifier that also accepts an
 * asymmetric algorithm can be handed a token signed with a published public key.
 */
export class BlTokenHelper {
  /**
   * Encode a JWT token
   * @param secret jwt secret
   * @param payload info to encode in JWT
   * @param expiresIn token validity in seconds
   */
  public static encodeToken(secret: string, payload: any, expiresIn: number): string {
    return jwt.sign(payload, secret, { algorithm: BL_JWT_SESSION_ALGORITHM, expiresIn: expiresIn });
  }

  /**
   * Decode the jwt and verify the expiration
   * @param secret jwt secret
   * @param token token to decode
   */
  public static decodeToken(secret: string, token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, { algorithms: [BL_JWT_SESSION_ALGORITHM] }, (err, decoded) => {
        if (err) {
          reject(err);
        }
        resolve(decoded);
      });
    });
  }
}
