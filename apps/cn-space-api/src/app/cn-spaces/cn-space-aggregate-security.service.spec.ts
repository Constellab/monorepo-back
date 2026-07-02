import { BlUnauthorizedException, BlUserCategory } from '@monorepo/back-core-lib';

import { CnUser } from '../cn-users/cn-user.entity';
import { CnSpaceAggregateSecurity } from './cn-space-aggregate-security.service';
import { CnSpaceUser, CnSpaceUserRole } from './cn-space-user.entity';
import { CnSpaceUserService } from './cn-space-user.service';

/**
 * Reference unit test — copy this structure for guards and *-security.service.ts.
 *
 * No NestJS module, no DB: the single dependency (CnSpaceUserService) is a plain
 * mock, so the test is fast and only covers the authorization branching. We
 * assert BOTH the pass path and the exact exception on the fail path.
 */
describe('CnSpaceAggregateSecurity', () => {
  const spaceId = 'space-1';

  let service: CnSpaceAggregateSecurity;
  let spaceUserService: { findOneBySpaceIdAndUserId: jest.Mock };

  beforeEach(() => {
    spaceUserService = { findOneBySpaceIdAndUserId: jest.fn() };
    service = new CnSpaceAggregateSecurity(spaceUserService as unknown as CnSpaceUserService);
  });

  // Build a minimal CnUser with only what the security service reads.
  function makeUser(category: BlUserCategory, id = 'user-1'): CnUser {
    return {
      id,
      category,
      isAdmin: () => category === BlUserCategory.ADMIN,
    } as unknown as CnUser;
  }

  // Build a minimal space membership with a given role.
  function makeSpaceUser(role: CnSpaceUserRole): CnSpaceUser {
    return {
      role,
      isSpaceAdmin: () => role === CnSpaceUserRole.ADMIN,
      isSpaceViewer: () => role === CnSpaceUserRole.VIEWER,
    } as unknown as CnSpaceUser;
  }

  const globalAdmin = (): CnUser => makeUser(BlUserCategory.ADMIN);
  const normalUser = (): CnUser => makeUser(BlUserCategory.USER);

  describe('checkIsAdmin', () => {
    it('passes for a global admin', () => {
      expect(() => service.checkIsAdmin(globalAdmin())).not.toThrow();
    });

    it('throws for a non-admin', () => {
      expect(() => service.checkIsAdmin(normalUser())).toThrow(BlUnauthorizedException);
    });
  });

  describe('checkIsSpaceAdmin', () => {
    it('passes for a global admin without hitting the DB', async () => {
      await expect(service.checkIsSpaceAdmin(spaceId, globalAdmin())).resolves.toBeUndefined();
      expect(spaceUserService.findOneBySpaceIdAndUserId).not.toHaveBeenCalled();
    });

    it('passes for a space admin', async () => {
      spaceUserService.findOneBySpaceIdAndUserId.mockResolvedValue(makeSpaceUser(CnSpaceUserRole.ADMIN));
      await expect(service.checkIsSpaceAdmin(spaceId, normalUser())).resolves.toBeUndefined();
    });

    it('throws for a space member who is not admin', async () => {
      spaceUserService.findOneBySpaceIdAndUserId.mockResolvedValue(makeSpaceUser(CnSpaceUserRole.USER));
      await expect(service.checkIsSpaceAdmin(spaceId, normalUser())).rejects.toThrow(BlUnauthorizedException);
    });

    it('throws for a non-member', async () => {
      spaceUserService.findOneBySpaceIdAndUserId.mockResolvedValue(null);
      await expect(service.checkIsSpaceAdmin(spaceId, normalUser())).rejects.toThrow(BlUnauthorizedException);
    });
  });

  describe('checkIsSpaceUser', () => {
    it('passes for a global admin', async () => {
      await expect(service.checkIsSpaceUser(spaceId, globalAdmin())).resolves.toBeUndefined();
      expect(spaceUserService.findOneBySpaceIdAndUserId).not.toHaveBeenCalled();
    });

    it('passes for any space member', async () => {
      spaceUserService.findOneBySpaceIdAndUserId.mockResolvedValue(makeSpaceUser(CnSpaceUserRole.VIEWER));
      await expect(service.checkIsSpaceUser(spaceId, normalUser())).resolves.toBeUndefined();
    });

    it('throws for a non-member', async () => {
      spaceUserService.findOneBySpaceIdAndUserId.mockResolvedValue(null);
      await expect(service.checkIsSpaceUser(spaceId, normalUser())).rejects.toThrow(BlUnauthorizedException);
    });
  });

  describe('checkIsSpaceUserOrAbove', () => {
    it('passes for a global admin', async () => {
      await expect(service.checkIsSpaceUserOrAbove(spaceId, globalAdmin())).resolves.toBeUndefined();
    });

    it('passes for a space user (editor)', async () => {
      spaceUserService.findOneBySpaceIdAndUserId.mockResolvedValue(makeSpaceUser(CnSpaceUserRole.USER));
      await expect(service.checkIsSpaceUserOrAbove(spaceId, normalUser())).resolves.toBeUndefined();
    });

    it('throws for a space viewer', async () => {
      spaceUserService.findOneBySpaceIdAndUserId.mockResolvedValue(makeSpaceUser(CnSpaceUserRole.VIEWER));
      await expect(service.checkIsSpaceUserOrAbove(spaceId, normalUser())).rejects.toThrow(
        BlUnauthorizedException
      );
    });

    it('throws for a non-member', async () => {
      spaceUserService.findOneBySpaceIdAndUserId.mockResolvedValue(null);
      await expect(service.checkIsSpaceUserOrAbove(spaceId, normalUser())).rejects.toThrow(
        BlUnauthorizedException
      );
    });
  });
});
