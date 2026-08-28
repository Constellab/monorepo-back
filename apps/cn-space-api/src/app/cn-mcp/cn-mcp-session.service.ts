import { BlRequestContext, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import {
  CnAuthContext,
  CnAuthContextMcp,
  CnAuthContextMcpNoSpace,
} from '../cn-core/utils/cn-auth-context.class';
import { CnRequest } from '../cn-core/utils/cn-current-user.helper';
import { CnSpace } from '../cn-spaces/cn-space.entity';
import { CnSpaceService } from '../cn-spaces/cn-space.service';
import { CnSpaceUser, CnSpaceUserRole } from '../cn-spaces/cn-space-user.entity';
import { CnSpaceUserService } from '../cn-spaces/cn-space-user.service';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { CnUser } from '../cn-users/cn-user.entity';
import { CN_MCP_SPACE_REQUIRED_MESSAGE, CN_MCP_TOOL_LIST_SPACES } from './cn-mcp.constants';

/**
 * The one place a machine call acquires an identity, and the one place it acquires a Space.
 *
 * Every tool runs inside {@link asCaller} or {@link inSpace} and gets what it needs as an
 * argument, so a tool cannot reach Space-owned data without having passed the membership
 * and role lookup: there is no path into the auth context that skips this class. ADR-0003
 * asks for exactly that — the Space id a model sends **selects**, this lookup
 * **authorizes**, and "every tool remembers to check" is not a property anyone can verify
 * by reading.
 *
 * The lookup is the browser's, not a second one written for machines: a platform admin is
 * an admin of every Space here as they are there, and a member gets the role the
 * membership row carries. That is what makes "enforced exactly as in the browser" true by
 * construction rather than by two implementations agreeing.
 *
 * Nothing is remembered between calls, and nothing is shared between them: each call runs
 * in an auth context of its own. That is what keeps the server stateless, and it is not
 * only about consecutive calls — the MCP transport dispatches every message of one POST
 * without awaiting the previous one, so two tool calls naming two Spaces can be in flight
 * together, and a context stored per request rather than per call would have them read
 * each other's Space.
 */
@Injectable()
export class CnMcpSession {
  constructor(
    private readonly spaceService: CnSpaceService,
    private readonly spaceUserService: CnSpaceUserService
  ) {}

  /**
   * Run a tool that reaches no Space-owned data — the two that answer "which Spaces are
   * there". The context carries the user and deliberately no Space, so a Space-scoped
   * check reached from here refuses rather than picking one.
   */
  public async asCaller<T>(request: CnRequest, run: (user: CnUser) => Promise<T>): Promise<T> {
    const user = this.callerOf(request);
    return this.inContext(request, new CnAuthContextMcpNoSpace(user), () => run(user));
  }

  /**
   * Run a tool in the Space named on the call, after checking the caller may reach it.
   *
   * Refuses before `run` is ever reached: a missing id and a Space the caller is not in
   * both end here, and the tool body only exists inside the callback.
   */
  public async inSpace<T>(
    request: CnRequest,
    spaceId: string | undefined | null,
    run: (userInfo: CnUserSpaceInfo) => Promise<T>
  ): Promise<T> {
    const userInfo = await this.authorizeSpace(this.callerOf(request), spaceId);
    return this.inContext(request, new CnAuthContextMcp(userInfo), () => run(userInfo));
  }

  /**
   * The caller, as {@link CnMcpAuthGuard} established them from the access token.
   *
   * Taken from the request the MCP library hands the tool, not from the ambient request
   * context: the call travels through the transport before reaching a tool, and an
   * identity read out of the air is one more thing that has to hold for the endpoint to be
   * safe rather than merely to work.
   */
  private callerOf(request: CnRequest): CnUser {
    const user = request?.user;
    if (user == null) {
      // Only reachable if a tool ran outside the guarded endpoint. Refusing is the only
      // safe answer: there is no caller to attribute the call to.
      throw new BlUnauthorizedException('No authenticated caller on this request');
    }
    return user;
  }

  /**
   * Membership and role for the Space the caller named, or a refusal.
   *
   * A Space that does not exist and a Space the caller is not in give the same answer on
   * purpose: the difference is only useful to someone probing for which Spaces exist.
   */
  private async authorizeSpace(user: CnUser, spaceId: string | undefined | null): Promise<CnUserSpaceInfo> {
    if (spaceId == null || spaceId.trim().length === 0) {
      throw new BlUnauthorizedException(CN_MCP_SPACE_REQUIRED_MESSAGE);
    }

    // The trimmed id in both the lookup and the refusal, so a Space that does not exist and
    // a Space the caller is not in cannot be told apart by the wording of the answer.
    const id = spaceId.trim();
    const space: CnSpace | null = await this.spaceService.findById(id);
    if (space == null) {
      throw new BlUnauthorizedException(this.unreachableSpaceMessage(id));
    }

    return new CnUserSpaceInfo(user, space, await this.roleInSpace(user, space));
  }

  /**
   * The caller's role in the Space, refusing when they have none.
   *
   * The two branches are `CnJwtAuthGuard`'s, kept in the same order and with the same
   * meaning: a platform admin counts as an admin of every Space — including, as #78
   * records, of Spaces they are not a member of — and everyone else must have an active
   * membership row.
   */
  private async roleInSpace(user: CnUser, space: CnSpace): Promise<CnSpaceUserRole> {
    if (user.isAdmin()) {
      return CnSpaceUserRole.ADMIN;
    }

    const spaceUser: CnSpaceUser | null = await this.spaceUserService.getSpaceUserIfAccess(space.id, user.id);
    if (spaceUser == null) {
      throw new BlUnauthorizedException(this.unreachableSpaceMessage(space.id));
    }
    return spaceUser.role;
  }

  private unreachableSpaceMessage(spaceId: string): string {
    return (
      `This account cannot reach the Space "${spaceId}". Call ${CN_MCP_TOOL_LIST_SPACES} to see the ` +
      `Spaces it belongs to, and use an id from there.`
    );
  }

  /**
   * Run the tool body with its own request context, carrying its own auth context.
   *
   * A store per call rather than a value written into the request's, because the transport
   * starts every message of one POST before the previous has finished: two calls naming two
   * Spaces overlap, and one slot for both means the second overwrites the first while it is
   * still running, or tears it down underneath it. `AsyncLocalStorage.run` gives each its
   * own and restores whatever was there when it returns — no teardown to forget, and
   * nothing to leak into the call that follows.
   *
   * It is also what makes the tools independent of the ambient context surviving the trip
   * through the transport: this establishes one rather than reading one.
   */
  private inContext<T>(request: CnRequest, authContext: CnAuthContext, run: () => Promise<T>): Promise<T> {
    const perCall = new BlRequestContext(request, request.res as Response, authContext, {});
    return BlRequestContext.cls.run(perCall, run);
  }
}
