import { Repository } from 'typeorm';

import { BlOAuthGrantEntity } from './bl-oauth-grant.entity';
import { BlOAuthGrantService } from './bl-oauth-grant.service';

/**
 * Stands in for an application's user entity.
 *
 * Deliberately not one of the real ones: the service only ever carries the owner through to
 * the foreign key, so a spec needing a real user model would be proving something the shared
 * code does not do.
 */
interface TestUser {
  id: string;
}

type TestGrant = BlOAuthGrantEntity<TestUser>;

const user: TestUser = { id: 'user-1' };
const CLIENT_ID = 'client-1';
const RESOURCE = 'https://api.example.com/mcp/community-doc';
const SECOND_RESOURCE = 'https://api.example.com/mcp/space';

const grantKey = (userId: string, clientId: string, resource: string): string =>
  BlOAuthGrantEntity.buildGrantKey(userId, clientId, resource);

interface Mocks {
  service: BlOAuthGrantService<TestUser>;
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
  countBy: jest.Mock;
  remove: jest.Mock;
}

/** By default nothing is on file: `countBy` answering 0 is a first approval. */
function buildService(): Mocks {
  const create = jest.fn().mockImplementation((partial: unknown) => partial);
  const save = jest.fn().mockImplementation((entity: unknown) => Promise.resolve(entity));
  const update = jest.fn().mockResolvedValue({ affected: 1 });
  const countBy = jest.fn().mockResolvedValue(0);
  const remove = jest.fn().mockResolvedValue({ affected: 1 });

  const repository = {
    create,
    save,
    update,
    countBy,
    delete: remove,
  } as unknown as Repository<TestGrant>;

  return { service: new BlOAuthGrantService<TestUser>(repository), create, save, update, countBy, remove };
}

/** A Grant already on file, so an approval refreshes it instead of inserting. */
function buildServiceWithExistingGrant(): Mocks {
  const mocks = buildService();
  mocks.countBy.mockResolvedValue(1);
  return mocks;
}

describe('BlOAuthGrantEntity.buildGrantKey', () => {
  it('is the same for the same user, client and Resource', () => {
    expect(grantKey('user-1', CLIENT_ID, RESOURCE)).toBe(grantKey('user-1', CLIENT_ID, RESOURCE));
  });

  it('differs on any of the three', () => {
    const keys = new Set([
      grantKey('user-1', CLIENT_ID, RESOURCE),
      grantKey('user-2', CLIENT_ID, RESOURCE),
      grantKey('user-1', 'client-2', RESOURCE),
      grantKey('user-1', CLIENT_ID, SECOND_RESOURCE),
    ]);

    // A key shared by two triples is a Grant that covers something the user never approved.
    expect(keys.size).toBe(4);
  });

  it('cannot be collided by shifting a value across a boundary', () => {
    // Concatenation without a separator no value can contain is how "user-1" + "a" ends up
    // equal to "user-1a" + "".
    expect(grantKey('user-1', 'a', RESOURCE)).not.toBe(grantKey('user-1a', '', RESOURCE));
  });

  it('is 64 hex characters, matching the column it is stored in', () => {
    expect(grantKey('user-1', CLIENT_ID, RESOURCE)).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('BlOAuthGrantService', () => {
  describe('approve', () => {
    it('records one Grant per Resource, each bound to exactly one', async () => {
      const { service, create, save } = buildService();

      await service.approve(user, CLIENT_ID, [RESOURCE, SECOND_RESOURCE]);

      expect(save).toHaveBeenCalledTimes(2);
      expect(create.mock.calls.map(([row]) => (row as TestGrant).resource)).toEqual([
        RESOURCE,
        SECOND_RESOURCE,
      ]);
      // One Resource per row, never a list: a Grant that could name two would be a Grant a
      // renewal could be widened into the second one.
      for (const [row] of create.mock.calls) {
        expect(typeof (row as TestGrant).resource).toBe('string');
      }
    });

    it('binds the row to the approving user, the client and the key of the three', async () => {
      const { service, create } = buildService();

      await service.approve(user, CLIENT_ID, [RESOURCE]);

      expect(create.mock.calls[0][0]).toMatchObject({
        grantKey: grantKey(user.id, CLIENT_ID, RESOURCE),
        clientId: CLIENT_ID,
        resource: RESOURCE,
        user,
      });
    });

    it('refreshes the Grant already on file instead of adding a second one', async () => {
      const { service, update, save } = buildServiceWithExistingGrant();

      await service.approve(user, CLIENT_ID, [RESOURCE]);

      // Approving again is not a new authorization, and two rows for one triple would make
      // "what has this client been approved for" a question with two answers.
      expect(update).toHaveBeenCalledWith(
        { grantKey: grantKey(user.id, CLIENT_ID, RESOURCE) },
        expect.objectContaining({ approvedAt: expect.anything() })
      );
      expect(save).not.toHaveBeenCalled();
    });

    it('refreshes it even when the row was written this very second', async () => {
      const { service, save, update } = buildServiceWithExistingGrant();
      // MySQL reports rows *changed*, not rows matched, so writing the same `approvedAt`
      // affects nothing. Inferring "no such row" from that would send an ordinary
      // re-approval down the insert path and log a concurrency warning nobody caused.
      update.mockResolvedValue({ affected: 0 });

      await service.approve(user, CLIENT_ID, [RESOURCE]);

      expect(save).not.toHaveBeenCalled();
    });

    it('refreshes the row that won a concurrent approval of the same Grant', async () => {
      const { service, save, update } = buildService();
      save.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      // The unique index rejected the insert, so the winner's row is on file and this caller
      // has nothing to add — only the approval time to bring forward.
      await expect(service.approve(user, CLIENT_ID, [RESOURCE])).resolves.toBeUndefined();
      expect(update).toHaveBeenCalledWith(
        { grantKey: grantKey(user.id, CLIENT_ID, RESOURCE) },
        expect.objectContaining({ approvedAt: expect.anything() })
      );
    });

    it('does not swallow a failure that is not a duplicate', async () => {
      const { service, save } = buildService();
      save.mockRejectedValue(new Error('the database is on fire'));

      // Reporting success here would hand out an authorization code for an approval that
      // was never recorded.
      await expect(service.approve(user, CLIENT_ID, [RESOURCE])).rejects.toThrow('the database is on fire');
    });

    it('records nothing for an empty list', async () => {
      const { service, save, update } = buildService();

      await service.approve(user, CLIENT_ID, []);

      expect(save).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });
  });

  describe('isGranted', () => {
    it('is true when a row exists for the triple', async () => {
      const { service, countBy } = buildService();
      countBy.mockResolvedValue(1);

      await expect(service.isGranted(user.id, CLIENT_ID, RESOURCE)).resolves.toBe(true);
      expect(countBy).toHaveBeenCalledWith({ grantKey: grantKey(user.id, CLIENT_ID, RESOURCE) });
    });

    it('is false when there is none', async () => {
      const { service, countBy } = buildService();
      countBy.mockResolvedValue(0);

      await expect(service.isGranted(user.id, CLIENT_ID, RESOURCE)).resolves.toBe(false);
    });
  });

  describe('areAllGranted', () => {
    it('is true only when every requested Resource is approved', async () => {
      const { service, countBy } = buildService();
      countBy.mockResolvedValue(2);

      await expect(service.areAllGranted(user.id, CLIENT_ID, [RESOURCE, SECOND_RESOURCE])).resolves.toBe(
        true
      );
    });

    it('is false when one of them is not', async () => {
      const { service, countBy } = buildService();
      countBy.mockResolvedValue(1);

      // Every, not any: a request pairing an approved Resource with a new one is a request
      // for something the user has not seen, so it must reach the consent screen.
      await expect(service.areAllGranted(user.id, CLIENT_ID, [RESOURCE, SECOND_RESOURCE])).resolves.toBe(
        false
      );
    });

    it('asks once for the whole list', async () => {
      const { service, countBy } = buildService();
      countBy.mockResolvedValue(2);

      await service.areAllGranted(user.id, CLIENT_ID, [RESOURCE, SECOND_RESOURCE]);

      // This runs on every authorization request; a round trip per Resource would put the
      // database in the path once per Resource for a question that is one lookup.
      expect(countBy).toHaveBeenCalledTimes(1);
    });

    it('counts a Resource named twice once, so a repeat cannot pass for two approvals', async () => {
      const { service, countBy } = buildService();
      countBy.mockResolvedValue(1);

      await expect(service.areAllGranted(user.id, CLIENT_ID, [RESOURCE, RESOURCE])).resolves.toBe(true);
    });

    it('is false for an empty list rather than vacuously true', async () => {
      const { service, countBy } = buildService();

      // "Nothing was asked for" must never be the answer that skips the screen.
      await expect(service.areAllGranted(user.id, CLIENT_ID, [])).resolves.toBe(false);
      expect(countBy).not.toHaveBeenCalled();
    });
  });

  describe('revoke', () => {
    it('deletes the Grant for exactly one triple', async () => {
      const { service, remove } = buildService();

      await service.revoke(user.id, CLIENT_ID, RESOURCE);

      // Scoped to the one Resource: revoking a client's access to one surface must not end
      // the approvals it holds for another.
      expect(remove).toHaveBeenCalledWith({ grantKey: grantKey(user.id, CLIENT_ID, RESOURCE) });
    });

    it('stays silent when there is nothing to delete', async () => {
      const { service, remove } = buildService();
      remove.mockResolvedValue({ affected: 0 });

      await expect(service.revoke(user.id, CLIENT_ID, RESOURCE)).resolves.toBeUndefined();
    });
  });
});
