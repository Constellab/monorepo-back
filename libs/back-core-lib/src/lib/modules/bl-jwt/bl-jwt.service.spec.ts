import { JwtService } from '@nestjs/jwt';

import { BL_JWT_SESSION_ALGORITHM } from './bl-jwt.class';
import { BlJwtService } from './bl-jwt.service';

function buildService(): { service: BlJwtService; sign: jest.Mock; verify: jest.Mock } {
  const sign = jest.fn().mockReturnValue('signed-token');
  const verify = jest.fn().mockReturnValue({ sub: 'user-1', email: 'user@example.com' });
  return { service: new BlJwtService({ sign, verify } as unknown as JwtService), sign, verify };
}

const payload = { sub: 'user-1', email: 'user@example.com' };

describe('BlJwtService', () => {
  describe('generateToken', () => {
    it('omits expiresIn when no override is given, so the module default applies', () => {
      const { service, sign } = buildService();
      service.generateToken('user-1', 'user@example.com');
      expect(sign).toHaveBeenCalledWith(payload, {});
    });

    it('passes the override through as expiresIn', () => {
      const { service, sign } = buildService();
      service.generateToken('user-1', 'user@example.com', 900);
      expect(sign).toHaveBeenCalledWith(payload, { expiresIn: 900 });
    });

    it('treats zero as an explicit override rather than as absent', () => {
      const { service, sign } = buildService();
      service.generateToken('user-1', 'user@example.com', 0);
      expect(sign).toHaveBeenCalledWith(payload, { expiresIn: 0 });
    });
  });

  describe('verifyToken', () => {
    it('accepts exactly one algorithm, the symmetric one', () => {
      // Without this, the same secret would also verify a token signed with the
      // *published* public key as an HMAC secret — the algorithm-confusion attack that
      // publishing keys at all makes possible. See BL_JWT_SESSION_ALGORITHM.
      const { service, verify } = buildService();

      service.verifyToken('a.jwt.token');

      expect(verify).toHaveBeenCalledWith('a.jwt.token', {
        algorithms: [BL_JWT_SESSION_ALGORITHM],
      });
    });

    it('returns the decoded payload', () => {
      const { service } = buildService();
      expect(service.verifyToken('a.jwt.token')).toEqual(payload);
    });
  });
});
