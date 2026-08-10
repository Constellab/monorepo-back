import { BlUnauthorizedException, BlUserCategory } from '@monorepo/back-core-lib';

import { CnCurrentUserHelper, CnRequest } from '../cn-core/utils/cn-current-user.helper';
import { CnSpace } from '../cn-spaces/cn-space.entity';
import { CnSpaceService } from '../cn-spaces/cn-space.service';
import { CnSpaceUser, CnSpaceUserRole } from '../cn-spaces/cn-space-user.entity';
import { CnSpaceUserService } from '../cn-spaces/cn-space-user.service';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnMcpSession } from './cn-mcp-session.service';

/**
 * The seam every MCP tool passes through, and therefore the one place cross-tenant safety
 * is decided (ADR-0003). What is asserted here is that a Space id chosen by a language
 * model only ever *selects*: the membership and role lookup is what lets a call through,
 * and it runs before the tool body exists.
 */
describe('CnMcpSession', () => {
  const SPACE_ID = 'space-1';

  let spaceService: { findById: jest.Mock };
  let spaceUserService: { getSpaceUserIfAccess: jest.Mock };
  let session: CnMcpSession;
  let toolBody: jest.Mock;

  beforeEach(() => {
    spaceService = { findById: jest.fn() };
    spaceUserService = { getSpaceUserIfAccess: jest.fn() };
    session = new CnMcpSession(
      spaceService as unknown as CnSpaceService,
      spaceUserService as unknown as CnSpaceUserService
    );
    toolBody = jest.fn().mockResolvedValue('tool ran');
  });

  /**
   * The request the MCP library hands a tool: the express request the guard put the
   * authenticated caller on.
   */
  function requestOf(user: CnUser | null): CnRequest {
    return { user: user ?? undefined, res: {} } as unknown as CnRequest;
  }

  function makeUser(category: BlUserCategory): CnUser {
    return { id: 'user-1', category, isAdmin: () => category === BlUserCategory.ADMIN } as unknown as CnUser;
  }

  const member = (): CnUser => makeUser(BlUserCategory.USER);
  const platformAdmin = (): CnUser => makeUser(BlUserCategory.ADMIN);

  function makeSpace(id = SPACE_ID): CnSpace {
    return { id, name: 'Gencovery' } as unknown as CnSpace;
  }

  function membership(role: CnSpaceUserRole): CnSpaceUser {
    return { role } as unknown as CnSpaceUser;
  }

  /** Let every pending promise advance, so two overlapping calls really interleave. */
  const tick = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

  describe('inSpace', () => {
    it('refuses a call with no Space, naming the tools that produce one', async () => {
      const request = requestOf(member());

      await expect(session.inSpace(request, undefined, toolBody)).rejects.toThrow(BlUnauthorizedException);
      // The model has no other way to learn what to do next: an MCP server cannot prompt.
      await expect(session.inSpace(request, undefined, toolBody)).rejects.toThrow(
        /constellab_get_default_space/
      );
      await expect(session.inSpace(request, undefined, toolBody)).rejects.toThrow(/constellab_list_spaces/);
      expect(toolBody).not.toHaveBeenCalled();
    });

    it('refuses a blank Space id rather than treating it as absent-but-fine', async () => {
      await expect(session.inSpace(requestOf(member()), '   ', toolBody)).rejects.toThrow(
        BlUnauthorizedException
      );
      expect(spaceService.findById).not.toHaveBeenCalled();
      expect(toolBody).not.toHaveBeenCalled();
    });

    it('refuses a Space the caller is not a member of', async () => {
      spaceService.findById.mockResolvedValue(makeSpace());
      spaceUserService.getSpaceUserIfAccess.mockResolvedValue(null);

      await expect(session.inSpace(requestOf(member()), SPACE_ID, toolBody)).rejects.toThrow(
        BlUnauthorizedException
      );
      expect(toolBody).not.toHaveBeenCalled();
    });

    it('answers the same way for a Space that does not exist, disclosing nothing', async () => {
      const request = requestOf(member());
      spaceService.findById.mockResolvedValue(makeSpace());
      spaceUserService.getSpaceUserIfAccess.mockResolvedValue(null);
      const notAMember = await session
        .inSpace(request, ` ${SPACE_ID} `, toolBody)
        .catch((error: Error) => error.message);

      spaceService.findById.mockResolvedValue(null);
      const noSuchSpace = await session
        .inSpace(request, ` ${SPACE_ID} `, toolBody)
        .catch((error: Error) => error.message);

      expect(noSuchSpace).toEqual(notAMember);
    });

    it('runs the tool with the role the membership carries', async () => {
      spaceService.findById.mockResolvedValue(makeSpace());
      spaceUserService.getSpaceUserIfAccess.mockResolvedValue(membership(CnSpaceUserRole.VIEWER));

      // Read back through the helper every Space-scoped check uses, not through the
      // argument: it is the helper that has to answer for a machine call.
      const seen = await session.inSpace(requestOf(member()), SPACE_ID, () =>
        Promise.resolve(CnCurrentUserHelper.getAndCheckUserSpaceInfo())
      );

      expect(seen.space.id).toEqual(SPACE_ID);
      expect(seen.roleInSpace).toEqual(CnSpaceUserRole.VIEWER);
    });

    it('keeps two overlapping calls in their own Space', async () => {
      // The transport starts every message of one POST without awaiting the previous, so
      // two tool calls naming two Spaces really can be in flight together. Each must read
      // the Space it was given, whatever the other is doing.
      const request = requestOf(member());
      spaceService.findById.mockImplementation((id: string) => Promise.resolve(makeSpace(id)));
      spaceUserService.getSpaceUserIfAccess.mockResolvedValue(membership(CnSpaceUserRole.USER));

      const readSpaceAcross = async (): Promise<string | undefined> => {
        const before = CnCurrentUserHelper.getCurrentSpace()?.id;
        await tick();
        const after = CnCurrentUserHelper.getCurrentSpace()?.id;
        return before === after ? after : 'changed under the call';
      };

      const [first, second] = await Promise.all([
        session.inSpace(request, 'space-a', readSpaceAcross),
        session.inSpace(request, 'space-b', readSpaceAcross),
      ]);

      expect(first).toEqual('space-a');
      expect(second).toEqual('space-b');
    });

    it('leaves no Space behind once the tool has run', async () => {
      spaceService.findById.mockResolvedValue(makeSpace());
      spaceUserService.getSpaceUserIfAccess.mockResolvedValue(membership(CnSpaceUserRole.USER));

      await session.inSpace(requestOf(member()), SPACE_ID, toolBody);

      // Stateless per ADR-0003: the next call starts with no Space, and the context the
      // tool ran in does not outlive it.
      expect(CnCurrentUserHelper.getCurrentSpace()).toBeNull();
    });

    it('leaves no Space behind when the tool throws', async () => {
      spaceService.findById.mockResolvedValue(makeSpace());
      spaceUserService.getSpaceUserIfAccess.mockResolvedValue(membership(CnSpaceUserRole.USER));

      await expect(
        session.inSpace(requestOf(member()), SPACE_ID, () => Promise.reject(new Error('boom')))
      ).rejects.toThrow('boom');

      expect(CnCurrentUserHelper.getCurrentSpace()).toBeNull();
    });

    it('gives a platform admin the ADMIN role without a membership lookup', async () => {
      // Enforced exactly as in the browser (`CnJwtAuthGuard`), which is what this ticket
      // asks for — and, as #78 records, is why the membership lookup does not run for a
      // platform admin on any path, machine or browser.
      spaceService.findById.mockResolvedValue(makeSpace());

      const role = await session.inSpace(requestOf(platformAdmin()), SPACE_ID, (userInfo) =>
        Promise.resolve(userInfo.roleInSpace)
      );

      expect(role).toEqual(CnSpaceUserRole.ADMIN);
      expect(spaceUserService.getSpaceUserIfAccess).not.toHaveBeenCalled();
    });
  });

  describe('asCaller', () => {
    it('runs with the caller and no Space, so a Space-scoped check still refuses', async () => {
      await session.asCaller(requestOf(member()), (user) => {
        expect(user.id).toEqual('user-1');
        expect(CnCurrentUserHelper.getCurrentUser()).toBe(user);
        expect(CnCurrentUserHelper.getCurrentSpace()).toBeNull();
        expect(() => CnCurrentUserHelper.getAndCheckUserSpaceInfo()).toThrow(BlUnauthorizedException);
        return Promise.resolve();
      });
    });

    it('refuses when the request carries no authenticated caller', async () => {
      await expect(session.asCaller(requestOf(null), toolBody)).rejects.toThrow(BlUnauthorizedException);
      expect(toolBody).not.toHaveBeenCalled();
    });
  });
});
