import {
  BlForbiddenException,
  BlResourceGuard,
  blResourceTokenOf,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { HnErrorText } from '../core/model/config/hn-error-text.class';
import { HnCurrentUserHelper, HnRequest } from '../core/utils/hn-current-user.helper';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';

/**
 * Who is calling the Community MCP endpoint: the generic Bearer check, then this
 * application's own user record behind the token's subject.
 *
 * Two halves because they answer different questions and only one of them is generic.
 * {@link BlResourceGuard} decides whether the token is acceptable *for this Resource* and
 * emits the `WWW-Authenticate` challenge when it is not. This guard then turns an accepted
 * token into an {@link HnUser} and puts it in the request's auth context — once per request,
 * before any tool runs, rather than in each tool. Every write path a later ticket adds reads
 * the current user through {@link HnCurrentUserHelper}, and a resolution done per tool is one
 * a new tool can forget to do.
 *
 * The token's `sub` is a Space API user id, which is also the id of the mirrored `HnUser`
 * (ADR-0001: the Space API owns the canonical record, this application holds a mirror keyed
 * by the same id). So the lookup is a plain `findOne`, and a subject with no row is a
 * Constellab user who has never been synchronized here.
 *
 * That case is a **403**, not a 401: the token is intact and was minted for this Resource, so
 * re-authenticating would produce the same token and a client told to retry would loop. And no
 * account is created on the fly — per ADR-0004 the access token carries `sub` and nothing else
 * this application would need (name, category, language, photo), so a row built here would be
 * a half-empty user record that the Space API's own synchronization would then have to repair.
 *
 * Read tools are behind this too, which is a deliberate narrowing recorded in ADR-0004: the
 * documentation is public on the web, but a machine client reaching it holds a Grant approved
 * by a named user, and one identity resolution for the whole endpoint is what keeps the write
 * tools from each having to establish their own.
 */
@Injectable()
export class HnMcpAuthGuard implements CanActivate {
  private userService: HnUserService | null = null;

  /**
   * `ModuleRef` rather than constructor injection: @rekog builds the MCP controller inside a
   * dynamic module that imports nothing, so a guard attached to it is instantiated in that
   * module's context and can only be handed providers that are globally scoped.
   * `HnUserService` is not, and making it so to satisfy one guard would be the larger change.
   * Resolution is deferred to the first call, once the container is fully built.
   */
  constructor(
    private readonly resourceGuard: BlResourceGuard,
    private readonly moduleRef: ModuleRef
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Throws with the challenge header on anything wrong with the token itself. Awaited: the
    // payload below is published by that guard *after* its own await, so reading the request
    // without waiting reads it one microtask too early — a valid token refused, and refused
    // without the challenge, so a client cannot recover by re-authenticating.
    if (!(await this.resourceGuard.canActivate(context))) {
      return false;
    }

    const request = context.switchToHttp().getRequest<HnRequest>();
    const payload = blResourceTokenOf(request);
    if (payload == null) {
      throw new BlUnauthorizedException(HnErrorText.WRONG_TOKEN);
    }

    const user: HnUser | null = await this.getUserService().findOne(payload.sub);
    if (user == null) {
      throw new BlForbiddenException(HnErrorText.MCP_NO_COMMUNITY_ACCOUNT);
    }

    // On the request as well as in the context: the ambient context is what tools and services
    // read, and the request is what the MCP library hands a tool handler directly — so a caller
    // that has one has the other.
    request.user = user;
    HnCurrentUserHelper.setAuthContext({ type: 'mcp', user });
    return true;
  }

  private getUserService(): HnUserService {
    const resolved: HnUserService =
      this.userService ?? this.moduleRef.get<HnUserService>(HnUserService, { strict: false });
    this.userService = resolved;
    return resolved;
  }
}
