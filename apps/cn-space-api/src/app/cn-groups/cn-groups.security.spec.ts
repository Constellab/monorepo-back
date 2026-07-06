import { BlUnauthorizedException } from '@monorepo/back-core-lib';

import { CnSpaceUserRole } from '../cn-spaces/cn-space-user.entity';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnGroupTeam } from './cn-group.entity';
import { CnGroupsSecurity } from './cn-groups.security';
import { CnGroupsService } from './cn-groups.service';
import { CnUserTeamService } from './cn-user-team.service';

/**
 * Unit test for the group authorization branching. No DB: the two dependencies
 * are plain mocks, and we assert both the pass path and the exact exception on
 * the fail path for each authorization method.
 */
describe('CnGroupsSecurity', () => {
  const spaceId = 'space-1';
  const otherSpaceId = 'space-2';
  const teamId = 'team-1';

  let security: CnGroupsSecurity;
  let userGroupService: { userIsInTeam: jest.Mock };
  let groupService: { getAndCheckTeamById: jest.Mock };

  beforeEach(() => {
    userGroupService = { userIsInTeam: jest.fn() };
    groupService = { getAndCheckTeamById: jest.fn() };
    security = new CnGroupsSecurity(
      userGroupService as unknown as CnUserTeamService,
      groupService as unknown as CnGroupsService
    );
  });

  // Minimal user + space info with a given global-admin flag and space role.
  function makeUserInfo(role: CnSpaceUserRole, isGlobalAdmin = false, id = 'user-1'): CnUserSpaceInfo {
    const user = { id, isAdmin: () => isGlobalAdmin } as unknown as CnUser;
    return new CnUserSpaceInfo(user, { id: spaceId } as never, role);
  }

  function makeTeam(teamSpaceId: string): CnGroupTeam {
    return { id: teamId, spaceId: teamSpaceId } as unknown as CnGroupTeam;
  }

  describe('checkAuthorizationToGetTeam', () => {
    it('passes when the team is in the user space', () => {
      const userInfo = makeUserInfo(CnSpaceUserRole.VIEWER);
      expect(() => security.checkAuthorizationToGetTeam(userInfo, makeTeam(spaceId))).not.toThrow();
    });

    it('throws when the team belongs to another space', () => {
      const userInfo = makeUserInfo(CnSpaceUserRole.ADMIN);
      expect(() => security.checkAuthorizationToGetTeam(userInfo, makeTeam(otherSpaceId))).toThrow(
        BlUnauthorizedException
      );
    });
  });

  describe('getAndCheckAuthorizationToGetTeam', () => {
    it('loads the team then checks the space', async () => {
      groupService.getAndCheckTeamById.mockResolvedValue(makeTeam(spaceId));
      const userInfo = makeUserInfo(CnSpaceUserRole.USER);

      await expect(security.getAndCheckAuthorizationToGetTeam(userInfo, teamId)).resolves.toEqual(
        makeTeam(spaceId)
      );
      expect(groupService.getAndCheckTeamById).toHaveBeenCalledWith(teamId);
    });

    it('throws for a team in another space', async () => {
      groupService.getAndCheckTeamById.mockResolvedValue(makeTeam(otherSpaceId));
      const userInfo = makeUserInfo(CnSpaceUserRole.USER);

      await expect(security.getAndCheckAuthorizationToGetTeam(userInfo, teamId)).rejects.toThrow(
        BlUnauthorizedException
      );
    });
  });

  describe('getAndCheckAuthorizationToUpdateTeam', () => {
    it('passes for a space admin without checking team membership', async () => {
      groupService.getAndCheckTeamById.mockResolvedValue(makeTeam(spaceId));
      const userInfo = makeUserInfo(CnSpaceUserRole.ADMIN);

      await expect(security.getAndCheckAuthorizationToUpdateTeam(userInfo, teamId)).resolves.toBeDefined();
      expect(userGroupService.userIsInTeam).not.toHaveBeenCalled();
    });

    it('passes for a non-admin who is a member of the team', async () => {
      groupService.getAndCheckTeamById.mockResolvedValue(makeTeam(spaceId));
      userGroupService.userIsInTeam.mockResolvedValue(true);
      const userInfo = makeUserInfo(CnSpaceUserRole.USER);

      await expect(security.getAndCheckAuthorizationToUpdateTeam(userInfo, teamId)).resolves.toBeDefined();
    });

    it('throws for a non-admin who is not a member of the team', async () => {
      groupService.getAndCheckTeamById.mockResolvedValue(makeTeam(spaceId));
      userGroupService.userIsInTeam.mockResolvedValue(false);
      const userInfo = makeUserInfo(CnSpaceUserRole.USER);

      await expect(security.getAndCheckAuthorizationToUpdateTeam(userInfo, teamId)).rejects.toThrow(
        BlUnauthorizedException
      );
    });

    it('throws when the team is in another space (before the membership check)', async () => {
      groupService.getAndCheckTeamById.mockResolvedValue(makeTeam(otherSpaceId));
      const userInfo = makeUserInfo(CnSpaceUserRole.ADMIN);

      await expect(security.getAndCheckAuthorizationToUpdateTeam(userInfo, teamId)).rejects.toThrow(
        BlUnauthorizedException
      );
    });
  });

  describe('checkAuthorizationToFindAllTeamBySpace', () => {
    it('passes for any user with a space', () => {
      const userInfo = makeUserInfo(CnSpaceUserRole.VIEWER);
      expect(() => security.checkAuthorizationToFindAllTeamBySpace(userInfo)).not.toThrow();
    });

    it('throws when there is no space', () => {
      const user = { id: 'user-1', isAdmin: () => false } as unknown as CnUser;
      const userInfo = new CnUserSpaceInfo(user, null as never, CnSpaceUserRole.USER);
      expect(() => security.checkAuthorizationToFindAllTeamBySpace(userInfo)).toThrow(
        BlUnauthorizedException
      );
    });
  });

  describe('checkAuthorizationToCreateTeam', () => {
    it('passes for a space user (editor)', () => {
      expect(() => security.checkAuthorizationToCreateTeam(makeUserInfo(CnSpaceUserRole.USER))).not.toThrow();
    });

    it('passes for a space admin', () => {
      expect(() =>
        security.checkAuthorizationToCreateTeam(makeUserInfo(CnSpaceUserRole.ADMIN))
      ).not.toThrow();
    });

    it('throws for a space viewer', () => {
      expect(() => security.checkAuthorizationToCreateTeam(makeUserInfo(CnSpaceUserRole.VIEWER))).toThrow(
        BlUnauthorizedException
      );
    });
  });
});
