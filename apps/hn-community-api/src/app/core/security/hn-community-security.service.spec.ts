import { BlUnauthorizedException } from '@monorepo/back-core-lib';

import { HnSpaceAggregateService } from '../../space-aggregate/hn-space-aggregate.service';
import { HnCommunitySecurity } from './hn-community-security.service';

/**
 * Reference unit test — copy this structure for guards and *-security.service.ts.
 *
 * No NestJS module, no DB: the single dependency (HnSpaceAggregateService) is a
 * plain mock, so the test is fast and only covers the authorization branching.
 * We assert BOTH the pass path and the exact exception on the fail path.
 */
describe('HnCommunitySecurity', () => {
  const userId = 'user-1';
  const otherUserId = 'user-2';

  let service: HnCommunitySecurity;
  let spaceAggregateService: { assertCheckSpaceUser: jest.Mock };

  beforeEach(() => {
    spaceAggregateService = { assertCheckSpaceUser: jest.fn() };
    service = new HnCommunitySecurity(spaceAggregateService as unknown as HnSpaceAggregateService);
  });

  describe('isCreator', () => {
    it('is true when the user created the entity', () => {
      expect(service.isCreator({ createdBy: { id: userId } }, userId)).toBe(true);
    });

    it('is false for another user', () => {
      expect(service.isCreator({ createdBy: { id: otherUserId } }, userId)).toBe(false);
    });

    it('is false when there is no creator', () => {
      expect(service.isCreator({}, userId)).toBe(false);
    });
  });

  describe('assertIsCreator', () => {
    it('passes for the creator', () => {
      expect(() => service.assertIsCreator({ createdBy: { id: userId } }, userId)).not.toThrow();
    });

    it('throws for a non-creator', () => {
      expect(() => service.assertIsCreator({ createdBy: { id: otherUserId } }, userId)).toThrow(
        BlUnauthorizedException
      );
    });
  });

  describe('isCoAuthor', () => {
    it('is true when the user is among the co-authors', () => {
      expect(service.isCoAuthor([{ user: { id: userId } }], userId)).toBe(true);
    });

    it('is false when the user is not a co-author', () => {
      expect(service.isCoAuthor([{ user: { id: otherUserId } }], userId)).toBe(false);
    });

    it('is false for an empty / undefined co-author list', () => {
      expect(service.isCoAuthor([], userId)).toBe(false);
      expect(service.isCoAuthor(undefined as unknown as { user: { id: string } }[], userId)).toBe(false);
    });
  });

  describe('isCreatorOrCoAuthor', () => {
    it('is true for the creator even without co-authors', () => {
      expect(service.isCreatorOrCoAuthor({ createdBy: { id: userId } }, [], userId)).toBe(true);
    });

    it('is true for a co-author who did not create the entity', () => {
      expect(
        service.isCreatorOrCoAuthor({ createdBy: { id: otherUserId } }, [{ user: { id: userId } }], userId)
      ).toBe(true);
    });

    it('is false when the user is neither', () => {
      expect(
        service.isCreatorOrCoAuthor(
          { createdBy: { id: otherUserId } },
          [{ user: { id: otherUserId } }],
          userId
        )
      ).toBe(false);
    });
  });

  describe('assertIsCreatorOrCoAuthor', () => {
    it('passes for a co-author', () => {
      expect(() =>
        service.assertIsCreatorOrCoAuthor(
          { createdBy: { id: otherUserId } },
          [{ user: { id: userId } }],
          userId
        )
      ).not.toThrow();
    });

    it('throws when the user is neither creator nor co-author', () => {
      expect(() =>
        service.assertIsCreatorOrCoAuthor(
          { createdBy: { id: otherUserId } },
          [{ user: { id: otherUserId } }],
          userId
        )
      ).toThrow(BlUnauthorizedException);
    });
  });

  describe('assertIsAdmin', () => {
    it('passes for an admin user', () => {
      expect(() => service.assertIsAdmin({ isAdmin: () => true })).not.toThrow();
    });

    it('throws for a non-admin user', () => {
      expect(() => service.assertIsAdmin({ isAdmin: () => false })).toThrow(BlUnauthorizedException);
    });
  });

  describe('assertSpaceMembership', () => {
    it('delegates to the space aggregate when the entity has a space', async () => {
      await service.assertSpaceMembership({ space: { id: 'space-1' } }, userId);
      expect(spaceAggregateService.assertCheckSpaceUser).toHaveBeenCalledWith('space-1', userId);
    });

    it('does nothing when the entity has no space', async () => {
      await service.assertSpaceMembership({}, userId);
      expect(spaceAggregateService.assertCheckSpaceUser).not.toHaveBeenCalled();
    });

    it('propagates the exception when the user is not a space member', async () => {
      spaceAggregateService.assertCheckSpaceUser.mockRejectedValue(new BlUnauthorizedException());
      await expect(service.assertSpaceMembership({ space: { id: 'space-1' } }, userId)).rejects.toThrow(
        BlUnauthorizedException
      );
    });
  });
});
