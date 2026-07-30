import { JwtService } from '@nestjs/jwt';

import { BlJwtService } from './bl-jwt.service';

function buildService(): { service: BlJwtService; sign: jest.Mock } {
  const sign = jest.fn().mockReturnValue('signed-token');
  return { service: new BlJwtService({ sign } as unknown as JwtService), sign };
}

const payload = { sub: 'user-1', email: 'user@example.com' };
const resource = 'https://api.example.com/mcp/community-doc';

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

  describe('generateTokenForAudience', () => {
    it('sets the audience and omits expiresIn when no override is given', () => {
      const { service, sign } = buildService();
      service.generateTokenForAudience('user-1', 'user@example.com', resource);
      expect(sign).toHaveBeenCalledWith(payload, { audience: resource });
    });

    it('keeps the audience alongside the override', () => {
      const { service, sign } = buildService();
      service.generateTokenForAudience('user-1', 'user@example.com', resource, 3600);
      expect(sign).toHaveBeenCalledWith(payload, { audience: resource, expiresIn: 3600 });
    });
  });
});
