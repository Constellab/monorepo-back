import {
  BlForbiddenException,
  BlRequestContext,
  BlResourceGuard,
  BlResourceRequest,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ExecutionContext } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Response } from 'express';

import { HnCurrentUserHelper, HnRequest } from '../core/utils/hn-current-user.helper';
import { HnUser } from '../users/hn-user.entity';
import { HnMcpAuthGuard } from './hn-mcp-auth.guard';

/**
 * Only the half this guard adds is covered here: turning an accepted token into this
 * application's user record and publishing it. Whether the token itself is acceptable —
 * signature, audience, the `WWW-Authenticate` challenge — belongs to `BlResourceGuard` and is
 * covered by `bl-resource.guard.spec.ts`, which is why it is a mock here.
 */
describe('HnMcpAuthGuard', () => {
  const USER_ID = 'user-1';

  let resourceGuard: { canActivate: jest.Mock };
  let userService: { findOne: jest.Mock; createOrUpdate: jest.Mock };
  let request: HnRequest & BlResourceRequest;
  let guard: HnMcpAuthGuard;

  beforeEach(() => {
    resourceGuard = { canActivate: jest.fn().mockResolvedValue(true) };
    userService = { findOne: jest.fn(), createOrUpdate: jest.fn() };
    request = {
      blResourceToken: { sub: USER_ID, email: 'user@example.com' },
    } as unknown as HnRequest & BlResourceRequest;

    guard = new HnMcpAuthGuard(
      resourceGuard as unknown as BlResourceGuard,
      {
        get: jest.fn().mockReturnValue(userService),
      } as unknown as ModuleRef
    );
  });

  const context = (): ExecutionContext =>
    ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

  function makeUser(): HnUser {
    return { id: USER_ID } as unknown as HnUser;
  }

  /**
   * Inside a request context, as every real call is: the auth context lives there, and a
   * guard that only set the request would satisfy nothing a service later reads.
   */
  function inRequestScope<T>(run: () => T): T {
    let result: T | undefined;
    BlRequestContext.runWithContext(new BlRequestContext(request, {} as Response, null, {}), () => {
      result = run();
    });
    return result as T;
  }

  it('puts the Community user named by the token in the current context, before any tool runs', async () => {
    const user = makeUser();
    userService.findOne.mockResolvedValue(user);

    await inRequestScope(async () => {
      await expect(guard.canActivate(context())).resolves.toBe(true);

      expect(HnCurrentUserHelper.getCurrentUser()).toBe(user);
    });

    expect(userService.findOne).toHaveBeenCalledWith(USER_ID);
    expect(request.user).toBe(user);
  });

  it('refuses a valid token whose user was never synchronized here, naming the cause', async () => {
    userService.findOne.mockResolvedValue(null);

    // 403, not 401: the token is intact and minted for this Resource, so a client told to
    // re-authenticate would come back with the same token.
    await expect(guard.canActivate(context())).rejects.toThrow(BlForbiddenException);
    expect(request.user).toBeUndefined();
  });

  it('never creates a Community account from a token', async () => {
    userService.findOne.mockResolvedValue(null);

    await expect(guard.canActivate(context())).rejects.toThrow(BlForbiddenException);

    // The token carries `sub` and nothing else a user record needs, so a row built here
    // would be a half-empty one the Space API's synchronization then has to repair.
    expect(userService.createOrUpdate).not.toHaveBeenCalled();
  });

  it('refuses when no verified token was published for the request', async () => {
    delete request.blResourceToken;

    await expect(guard.canActivate(context())).rejects.toThrow(BlUnauthorizedException);
    expect(userService.findOne).not.toHaveBeenCalled();
  });

  it('leaves the token refusal to the generic guard', async () => {
    resourceGuard.canActivate.mockRejectedValue(new BlUnauthorizedException('invalid_token'));

    await expect(guard.canActivate(context())).rejects.toThrow(BlUnauthorizedException);
    expect(userService.findOne).not.toHaveBeenCalled();
  });
});
