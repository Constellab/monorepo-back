import { ClDateHelper } from '@monorepo/core-lib';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';

import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnUser } from '../../users/hn-user.entity';
import { HnRefreshToken } from './hn-refresh-token.entity';
import { HnRefreshTokenService } from './hn-refresh-token.service';

const user = { id: 'user-1', email: 'user@example.com' } as HnUser;

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

interface Mocks {
  service: HnRefreshTokenService;
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
}

function buildService(): Mocks {
  const create = jest.fn().mockImplementation((partial: unknown) => partial);
  const save = jest.fn().mockImplementation((entity: unknown) => Promise.resolve(entity));
  const findOne = jest.fn().mockResolvedValue(null);
  const update = jest.fn().mockResolvedValue({ affected: 1 });
  const remove = jest.fn().mockResolvedValue({ affected: 1 });

  const repository = {
    create,
    save,
    findOne,
    update,
    delete: remove,
  } as unknown as Repository<HnRefreshToken>;
  const configService = {
    getRefreshTokenDurationInSeconds: () => REFRESH_TTL_SECONDS,
  } as unknown as HnCoreConfigService;

  return {
    service: new HnRefreshTokenService(repository, configService),
    create,
    save,
    findOne,
    update,
    remove,
  };
}

/** A stored row as `rotate` expects to read it back. */
function storedRow(overrides: Partial<HnRefreshToken> = {}): HnRefreshToken {
  return {
    id: 'row-1',
    tokenHash: 'unused-in-assertions',
    kind: 'session',
    user,
    expiresAt: ClDateHelper.getDate().plus({ days: 30 }),
    clientId: null,
    resource: null,
    createdAt: ClDateHelper.getDate(),
    ...overrides,
  };
}

describe('HnRefreshTokenService', () => {
  describe('issue', () => {
    it('returns the token in clear and never stores it', async () => {
      const { service, create } = buildService();
      const token = await service.issue(user, 'session');

      expect(token).toMatch(/^[0-9a-f]{64}$/);
      const stored = create.mock.calls[0][0] as HnRefreshToken;
      expect(stored.tokenHash).toBe(sha256(token));
      expect(stored.tokenHash).not.toBe(token);
      expect(JSON.stringify(stored)).not.toContain(token);
    });

    it('issues distinct tokens', async () => {
      const { service } = buildService();
      const [first, second] = [await service.issue(user, 'session'), await service.issue(user, 'session')];
      expect(first).not.toBe(second);
    });

    it('sets the expiry from the configured lifetime', async () => {
      const { service, create } = buildService();
      await service.issue(user, 'session');

      const stored = create.mock.calls[0][0] as HnRefreshToken;
      const seconds = stored.expiresAt.diff(ClDateHelper.getDate(), 'seconds').seconds;
      expect(seconds).toBeGreaterThan(REFRESH_TTL_SECONDS - 60);
      expect(seconds).toBeLessThanOrEqual(REFRESH_TTL_SECONDS);
    });

    it('records the OAuth binding when given, and leaves it null otherwise', async () => {
      const { service, create } = buildService();
      await service.issue(user, 'oauth', { clientId: 'client-1', resource: 'https://api/mcp/doc' });
      expect(create.mock.calls[0][0]).toMatchObject({
        kind: 'oauth',
        clientId: 'client-1',
        resource: 'https://api/mcp/doc',
      });

      await service.issue(user, 'session');
      expect(create.mock.calls[1][0]).toMatchObject({ kind: 'session', clientId: null, resource: null });
    });
  });

  describe('rotate', () => {
    it('replaces the token and returns the session owner', async () => {
      const { service, findOne, update } = buildService();
      findOne.mockResolvedValue(storedRow());

      const result = await service.rotate('presented', 'session');

      expect(result).not.toBeNull();
      expect(result?.user).toBe(user);
      expect(result?.token).toMatch(/^[0-9a-f]{64}$/);
      expect(result?.token).not.toBe('presented');

      // guarded on the OLD hash: that is what makes the rotation single-use
      expect(update).toHaveBeenCalledWith(
        { tokenHash: sha256('presented') },
        expect.objectContaining({ tokenHash: sha256(result?.token ?? '') })
      );
    });

    it('looks the row up by kind, so the two surfaces cannot be crossed', async () => {
      const { service, findOne } = buildService();
      findOne.mockResolvedValue(storedRow());

      await service.rotate('presented', 'oauth');

      expect(findOne).toHaveBeenCalledWith({
        where: { tokenHash: sha256('presented'), kind: 'oauth' },
        relations: { user: true },
      });
    });

    it('carries the OAuth binding over to the caller', async () => {
      const { service, findOne } = buildService();
      findOne.mockResolvedValue(
        storedRow({ kind: 'oauth', clientId: 'client-1', resource: 'https://api/mcp/doc' })
      );

      const result = await service.rotate('presented', 'oauth');

      expect(result?.clientId).toBe('client-1');
      expect(result?.resource).toBe('https://api/mcp/doc');
    });

    it('rejects an unknown token', async () => {
      const { service, findOne, update } = buildService();
      findOne.mockResolvedValue(null);

      await expect(service.rotate('nope', 'session')).resolves.toBeNull();
      expect(update).not.toHaveBeenCalled();
    });

    it('rejects an expired token without touching the row', async () => {
      const { service, findOne, update } = buildService();
      findOne.mockResolvedValue(storedRow({ expiresAt: ClDateHelper.getDate().minus({ minutes: 1 }) }));

      await expect(service.rotate('presented', 'session')).resolves.toBeNull();
      expect(update).not.toHaveBeenCalled();
    });

    it('rejects a replay: zero affected rows means someone else rotated first', async () => {
      const { service, findOne, update } = buildService();
      findOne.mockResolvedValue(storedRow());
      update.mockResolvedValue({ affected: 0 });

      await expect(service.rotate('presented', 'session')).resolves.toBeNull();
    });
  });

  describe('revoke', () => {
    it('deletes the row matching the presented token', async () => {
      const { service, remove } = buildService();
      await service.revoke('presented');
      expect(remove).toHaveBeenCalledWith({ tokenHash: sha256('presented') });
    });

    it('stays silent for an unknown token, so a stale logout still succeeds', async () => {
      const { service, remove } = buildService();
      remove.mockResolvedValue({ affected: 0 });
      await expect(service.revoke('nope')).resolves.toBeUndefined();
    });
  });

  describe('deleteExpired', () => {
    it('reports how many rows it removed', async () => {
      const { service, remove } = buildService();
      remove.mockResolvedValue({ affected: 7 });
      await expect(service.deleteExpired()).resolves.toBe(7);
    });

    it('reports zero when the driver returns no count', async () => {
      const { service, remove } = buildService();
      remove.mockResolvedValue({});
      await expect(service.deleteExpired()).resolves.toBe(0);
    });
  });
});
