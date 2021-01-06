import {Injectable} from '@nestjs/common';
import {CoreConfigService} from '../../modules/core-config/core-config.service';

const jwt = require('jsonwebtoken');

@Injectable()
export class TokenService {

  constructor(private configService: CoreConfigService) {
  }

  /**
   * Encode a JWT token
   * @param payload info to encode in JWT
   * @param expiresIn token validity in seconds
   */
  encodeToken(payload: any, expiresIn: number): string {
    return jwt.sign(payload, this.configService.getOtherJwtSecret(),
      {expiresIn: expiresIn});
  }

  /**
   * Decode the jwt and verify the expiration
   * @param token token to decode
   */
  decodeToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.configService.getOtherJwtSecret(), (
        (err, decoded) => {
          if (err) {
            reject(err);
          }
          resolve(decoded);
        }
      ));
    });
  }

}
