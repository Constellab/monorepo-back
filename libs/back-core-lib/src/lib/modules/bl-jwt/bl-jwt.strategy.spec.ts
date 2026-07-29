import { BlUnauthorizedException } from '../../exceptions/bl-unauthorized.exception';
import { BlUser } from '../../models/bl-user/bl-user.class';
import { BlDecodedToken, BlJwtConfig } from './bl-jwt.class';
import { BlJwtStrategy } from './bl-jwt.strategy';

const user = { id: 'user-1', email: 'user@example.com' } as BlUser;

const sessionPayload: BlDecodedToken = { sub: 'user-1', email: 'user@example.com' };

const mcpResource = 'https://api.example.com/mcp/community-doc';

function buildStrategy(overrides: Partial<BlJwtConfig> = {}): {
  strategy: BlJwtStrategy;
  findOne: jest.Mock;
} {
  const findOne = jest.fn().mockResolvedValue(user);
  const config: BlJwtConfig = {
    jwtSecret: 'test-secret',
    jwtFromRequest: () => undefined,
    usersService: { findOne },
    tokenDurationInSeconds: 3600,
    ...overrides,
  };
  return { strategy: new BlJwtStrategy(config), findOne };
}

describe('BlJwtStrategy.validate', () => {
  it('returns the user for a session token (no aud)', async () => {
    const { strategy, findOne } = buildStrategy();
    await expect(strategy.validate(sessionPayload)).resolves.toBe(user);
    expect(findOne).toHaveBeenCalledWith('user-1');
  });

  it('throws when the user no longer exists', async () => {
    const { strategy } = buildStrategy({
      usersService: { findOne: jest.fn().mockResolvedValue(null) },
    });
    await expect(strategy.validate(sessionPayload)).rejects.toThrow(BlUnauthorizedException);
  });

  it('rejects a resource-scoped token with a string aud', async () => {
    const { strategy } = buildStrategy();
    await expect(strategy.validate({ ...sessionPayload, aud: mcpResource })).rejects.toThrow(
      BlUnauthorizedException
    );
  });

  it('rejects a resource-scoped token with an array aud', async () => {
    const { strategy } = buildStrategy();
    await expect(strategy.validate({ ...sessionPayload, aud: [mcpResource] })).rejects.toThrow(
      BlUnauthorizedException
    );
  });

  it('rejects before querying the database', async () => {
    const { strategy, findOne } = buildStrategy();
    await expect(strategy.validate({ ...sessionPayload, aud: mcpResource })).rejects.toThrow();
    expect(findOne).not.toHaveBeenCalled();
  });
});
