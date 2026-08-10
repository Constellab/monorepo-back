import { BlResourceGuard, BlResourceRequest, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { ExecutionContext } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { CnRequest } from '../cn-core/utils/cn-current-user.helper';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnMcpAuthGuard } from './cn-mcp-auth.guard';

/**
 * Only the half this guard adds is covered here: turning an accepted token into this
 * application's user record. Whether the token itself is acceptable — signature, audience,
 * the `WWW-Authenticate` challenge — belongs to `BlResourceGuard` and is covered by
 * `bl-resource.guard.spec.ts`, which is why it is a mock here.
 */
describe('CnMcpAuthGuard', () => {
  const USER_ID = 'user-1';

  let resourceGuard: { canActivate: jest.Mock };
  let usersService: { findOne: jest.Mock; updateLastConnectedSpace: jest.Mock };
  let request: CnRequest & BlResourceRequest;
  let guard: CnMcpAuthGuard;

  beforeEach(() => {
    resourceGuard = { canActivate: jest.fn().mockReturnValue(true) };
    usersService = { findOne: jest.fn(), updateLastConnectedSpace: jest.fn() };
    request = {
      blResourceToken: { sub: USER_ID, email: 'user@example.com' },
    } as unknown as CnRequest & BlResourceRequest;

    guard = new CnMcpAuthGuard(
      resourceGuard as unknown as BlResourceGuard,
      {
        get: jest.fn().mockReturnValue(usersService),
      } as unknown as ModuleRef
    );
  });

  const context = (): ExecutionContext =>
    ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

  function makeUser(): CnUser {
    return { id: USER_ID, lastConnectedSpaceId: 'space-the-browser-was-in' } as unknown as CnUser;
  }

  it('puts the user named by the token on the request', async () => {
    const user = makeUser();
    usersService.findOne.mockResolvedValue(user);

    await expect(guard.canActivate(context())).resolves.toBe(true);

    expect(usersService.findOne).toHaveBeenCalledWith(USER_ID);
    expect(request.user).toBe(user);
  });

  it('never records where the browser last was', async () => {
    usersService.findOne.mockResolvedValue(makeUser());

    await guard.canActivate(context());

    // `lastConnectedSpaceId` is a trace of browser usage and the field the default-Space
    // tool reads back. A model exploring two Spaces must not move where the user's browser
    // lands after login, nor drift the answer it was just given.
    expect(usersService.updateLastConnectedSpace).not.toHaveBeenCalled();
    expect(request.user?.lastConnectedSpaceId).toEqual('space-the-browser-was-in');
  });

  it('refuses a token whose user no longer exists', async () => {
    usersService.findOne.mockResolvedValue(null);

    await expect(guard.canActivate(context())).rejects.toThrow(BlUnauthorizedException);
    expect(request.user).toBeUndefined();
  });

  it('refuses when no verified token was published for the request', async () => {
    delete request.blResourceToken;

    await expect(guard.canActivate(context())).rejects.toThrow(BlUnauthorizedException);
    expect(usersService.findOne).not.toHaveBeenCalled();
  });
});
