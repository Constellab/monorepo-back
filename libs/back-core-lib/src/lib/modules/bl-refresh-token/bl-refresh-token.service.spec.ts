import { ClDateHelper } from '@monorepo/core-lib';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';

import { BlRefreshTokenEntity } from './bl-refresh-token.entity';
import { BlRefreshTokenService } from './bl-refresh-token.service';

/**
 * Stands in for an application's user entity.
 *
 * Deliberately not one of the real ones: the service only ever carries the owner
 * through, so a spec that needed a real user model would be proving something the
 * shared code does not do.
 */
interface TestUser {
  id: string;
  email: string;
}

type TestRefreshToken = BlRefreshTokenEntity<TestUser>;

const user: TestUser = { id: 'user-1', email: 'user@example.com' };

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;

/** The token handed to `rotate` / `revoke` in every test. */
const PRESENTED = 'presented';

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

interface Mocks {
  service: BlRefreshTokenService<TestUser>;
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
  } as unknown as Repository<TestRefreshToken>;

  return {
    service: new BlRefreshTokenService<TestUser>(repository, () => REFRESH_TTL_SECONDS),
    create,
    save,
    findOne,
    update,
    remove,
  };
}

/**
 * A stored row as `rotate` expects to read it back.
 *
 * `tokenHash` defaults to the hash of PRESENTED, i.e. the row is the current head of
 * its chain — which is what makes the rotation path the default. A test that wants a
 * replay overrides it with something else.
 */
function storedRow(overrides: Partial<TestRefreshToken> = {}): TestRefreshToken {
  return {
    id: 'row-1',
    tokenHash: sha256(PRESENTED),
    previousTokenHash: null,
    kind: 'session',
    user,
    expiresAt: ClDateHelper.getDate().plus({ days: 30 }),
    clientId: null,
    resource: null,
    createdAt: ClDateHelper.getDate(),
    ...overrides,
  };
}

describe('BlRefreshTokenService', () => {
  describe('issue', () => {
    it('returns the token in clear and never stores it', async () => {
      const { service, create } = buildService();
      const token = await service.issue(user, 'session');

      expect(token).toMatch(/^[0-9a-f]{64}$/);
      const stored = create.mock.calls[0][0] as TestRefreshToken;
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

      const stored = create.mock.calls[0][0] as TestRefreshToken;
      const seconds = stored.expiresAt.diff(ClDateHelper.getDate(), 'seconds').seconds;
      expect(seconds).toBeGreaterThan(REFRESH_TTL_SECONDS - 60);
      expect(seconds).toBeLessThanOrEqual(REFRESH_TTL_SECONDS);
    });

    it('binds the row to the owner it was issued to', async () => {
      const { service, create } = buildService();
      await service.issue(user, 'session');

      // The shared code writes the relation and never reads inside it — the owner it
      // was handed is the owner the foreign key ends up pointing at.
      expect(create.mock.calls[0][0]).toMatchObject({ user });
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

      const result = await service.rotate(PRESENTED, 'session');

      expect(result).not.toBeNull();
      expect(result?.user).toBe(user);
      expect(result?.token).toMatch(/^[0-9a-f]{64}$/);
      expect(result?.token).not.toBe(PRESENTED);

      // guarded on the OLD hash: that is what makes the rotation single-use
      expect(update).toHaveBeenCalledWith(
        { tokenHash: sha256(PRESENTED) },
        expect.objectContaining({ tokenHash: sha256(result?.token ?? '') })
      );
    });

    it('looks the row up by kind on both hash columns, in one query', async () => {
      const { service, findOne } = buildService();
      findOne.mockResolvedValue(storedRow());

      await service.rotate(PRESENTED, 'oauth');

      // `kind` on BOTH branches: without it the OR would let a session token be
      // rotated through the OAuth surface via its previous hash.
      expect(findOne).toHaveBeenCalledWith({
        where: [
          { tokenHash: sha256(PRESENTED), kind: 'oauth' },
          { previousTokenHash: sha256(PRESENTED), kind: 'oauth' },
        ],
        relations: { user: true },
      });
      expect(findOne).toHaveBeenCalledTimes(1);
    });

    it('records the consumed hash, so the next presentation is recognizable', async () => {
      const { service, findOne, update } = buildService();
      findOne.mockResolvedValue(storedRow());

      await service.rotate(PRESENTED, 'session');

      expect(update).toHaveBeenCalledWith(
        { tokenHash: sha256(PRESENTED) },
        expect.objectContaining({ previousTokenHash: sha256(PRESENTED) })
      );
    });

    it('carries the OAuth binding over to the caller', async () => {
      const { service, findOne } = buildService();
      findOne.mockResolvedValue(
        storedRow({ kind: 'oauth', clientId: 'client-1', resource: 'https://api/mcp/doc' })
      );

      const result = await service.rotate(PRESENTED, 'oauth');

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

      await expect(service.rotate(PRESENTED, 'session')).resolves.toBeNull();
      expect(update).not.toHaveBeenCalled();
    });

    it('rejects a concurrent rotation: zero affected rows means someone else went first', async () => {
      const { service, findOne, update, remove } = buildService();
      findOne.mockResolvedValue(storedRow());
      update.mockResolvedValue({ affected: 0 });

      await expect(service.rotate(PRESENTED, 'session')).resolves.toBeNull();
      // Two requests racing with the same valid token are indistinguishable from a
      // legitimate double-submit, so this one only loses the race — the session lives.
      expect(remove).not.toHaveBeenCalled();
    });

    describe('replay of an already-consumed token', () => {
      /** A row whose chain has moved on: the presented hash is the one it consumed. */
      const rotatedAwayRow = (overrides: Partial<TestRefreshToken> = {}): TestRefreshToken =>
        storedRow({
          tokenHash: sha256('the-token-that-replaced-it'),
          previousTokenHash: sha256(PRESENTED),
          ...overrides,
        });

      it('destroys the whole session, not just the presented token', async () => {
        const { service, findOne, remove, update } = buildService();
        findOne.mockResolvedValue(rotatedAwayRow());

        await expect(service.rotate(PRESENTED, 'session')).resolves.toBeNull();

        // OAuth 2.1 §4.14.2: two holders of one chain means one is a thief, and we
        // cannot tell which — so the token currently in circulation dies too.
        expect(remove).toHaveBeenCalledWith({ id: 'row-1' });
        expect(update).not.toHaveBeenCalled();
      });

      it('destroys it even when the row has expired', async () => {
        const { service, findOne, remove } = buildService();
        findOne.mockResolvedValue(
          rotatedAwayRow({ expiresAt: ClDateHelper.getDate().minus({ minutes: 1 }) })
        );

        await expect(service.rotate(PRESENTED, 'session')).resolves.toBeNull();
        expect(remove).toHaveBeenCalledWith({ id: 'row-1' });
      });

      it('leaves an unknown token alone: nothing to attribute it to', async () => {
        const { service, findOne, remove } = buildService();
        findOne.mockResolvedValue(null);

        await expect(service.rotate(PRESENTED, 'session')).resolves.toBeNull();
        expect(remove).not.toHaveBeenCalled();
      });
    });
  });

  describe('revoke', () => {
    it('deletes the row matching the presented token', async () => {
      const { service, remove } = buildService();
      await service.revoke(PRESENTED);
      expect(remove).toHaveBeenCalledWith({ tokenHash: sha256(PRESENTED) });
    });

    it('stays silent for an unknown token, so a stale logout still succeeds', async () => {
      const { service, remove } = buildService();
      remove.mockResolvedValue({ affected: 0 });
      await expect(service.revoke('nope')).resolves.toBeUndefined();
    });
  });

  describe('revokeOAuthToken', () => {
    it('scopes the delete to the OAuth surface and the owning client', async () => {
      const { service, remove } = buildService();
      await service.revokeOAuthToken(PRESENTED, 'client-1');

      // /oauth/revoke is unauthenticated: without `kind` and `clientId` here, a token
      // reaching it could end a browser session or another client's session.
      expect(remove).toHaveBeenCalledWith([
        { tokenHash: sha256(PRESENTED), kind: 'oauth', clientId: 'client-1' },
        { previousTokenHash: sha256(PRESENTED), kind: 'oauth', clientId: 'client-1' },
      ]);
    });

    it('stays silent for a token that is not ours, as RFC 7009 §2.2 requires', async () => {
      const { service, remove } = buildService();
      remove.mockResolvedValue({ affected: 0 });
      await expect(service.revokeOAuthToken('nope', 'client-1')).resolves.toBeUndefined();
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
