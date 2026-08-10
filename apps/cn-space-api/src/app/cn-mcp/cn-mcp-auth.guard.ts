import { BlResourceGuard, blResourceTokenOf, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnRequest } from '../cn-core/utils/cn-current-user.helper';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnUsersService } from '../cn-users/cn-users.service';

/**
 * Who is calling the MCP endpoint: the generic Bearer check, then this application's own
 * user record behind the token's subject.
 *
 * Two halves because they answer different questions and only one of them is generic.
 * {@link BlResourceGuard} decides whether the token is acceptable *for this Resource* and
 * emits the `WWW-Authenticate` challenge when it is not — that is the whole of criterion
 * "no token, wrong audience or expired is refused with a challenge". This guard then turns
 * an accepted token into a {@link CnUser}, exactly as `BlJwtStrategy` does for a browser
 * Session token: same lookup, same refusal when the user is gone.
 *
 * It deliberately does NOT resolve a Space and does NOT touch `lastConnectedSpaceId`. Per
 * ADR-0003 the Space arrives per tool call, and that field is a trace of where the user's
 * browser was — a model exploring two Spaces must not move where the browser lands after
 * login, nor drift the value the default-Space tool had just reported.
 *
 * The auth context is left for {@link CnMcpSession} to set per call, because what it should
 * contain is not known until the tool's arguments are: with a Space for a Space-scoped tool,
 * without one for the two that answer "which Spaces are there".
 */
@Injectable()
export class CnMcpAuthGuard implements CanActivate {
  private usersService: CnUsersService | null = null;

  /**
   * `ModuleRef` rather than constructor injection: @rekog builds the MCP controller inside
   * a dynamic module that imports nothing, so a guard attached to it is instantiated in
   * that module's context and can only be handed providers that are globally scoped.
   * `CnUsersService` is not, and making it so to satisfy one guard would be the larger
   * change. Resolution is deferred to the first call, once the container is fully built.
   */
  constructor(
    private readonly resourceGuard: BlResourceGuard,
    private readonly moduleRef: ModuleRef
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Throws with the challenge header on anything wrong with the token itself.
    if (!this.resourceGuard.canActivate(context)) {
      return false;
    }

    const request = context.switchToHttp().getRequest<CnRequest>();
    const payload = blResourceTokenOf(request);
    if (payload == null) {
      throw new BlUnauthorizedException(CnErrorText.WRONG_TOKEN);
    }

    const user: CnUser | null = await this.getUsersService().findOne(payload.sub);
    if (user == null) {
      // The token is intact but names nobody: a Grant outliving the user it was approved
      // by. Refused here rather than left for a tool to notice.
      throw new BlUnauthorizedException(CnErrorText.WRONG_TOKEN);
    }

    request.user = user;
    return true;
  }

  private getUsersService(): CnUsersService {
    const resolved: CnUsersService =
      this.usersService ?? this.moduleRef.get<CnUsersService>(CnUsersService, { strict: false });
    this.usersService = resolved;
    return resolved;
  }
}
