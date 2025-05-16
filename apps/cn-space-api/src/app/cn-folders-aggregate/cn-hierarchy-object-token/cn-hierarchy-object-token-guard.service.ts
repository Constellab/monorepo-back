import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CN_HIERARCHY_OBJECT_TOKEN_HEADER } from '../../cn-core/model/config/cn-config.class';
import { CnAuthContextHierarchyObjectToken } from '../../cn-core/utils/cn-auth-context.class';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnSpaceService } from '../../cn-spaces/cn-space.service';
import { CnHierarchyObjectTokenService } from './cn-hierarchy-object-token.service';

/**
 * Guard for @CnHierarchyObjectTokenDecorator routes to check authentication with
 * folder access token.
 * when used the token authentication is priorized over the user authentication
 * If there is not token, the user authentication is used
 *
 * The {@link CnLabAuthGuard} check this decorator
 */
@Injectable()
export class CnHierarchyObjectTokenGuard {
  constructor(
    private hierarchyObjectTokenService: CnHierarchyObjectTokenService,
    private spaceService: CnSpaceService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = this.getTokenFromRequest(context);

    // if there is not token, don't authenticate and use the user authentication
    if (!token) {
      return false;
    }

    const hierarchyObjectToken = await this.hierarchyObjectTokenService.findByToken(token);
    if (!hierarchyObjectToken || !hierarchyObjectToken.isValid()) {
      throw new BlUnauthorizedException('Invalid link');
    }

    const space = await this.spaceService.findByIdAndCheck(hierarchyObjectToken.hierarchyObject.spaceId);

    // set the auth context
    const authContext = new CnAuthContextHierarchyObjectToken(
      space,
      hierarchyObjectToken.hierarchyObject,
      token
    );
    CnCurrentUserHelper.setAuthContext(authContext);

    return true;
  }

  private getTokenFromRequest(context: ExecutionContext): string | null {
    const request: Request = context.switchToHttp().getRequest();

    /**
     * Extract the token from the query (?token=123) parameter or from the header
     */
    const urlToken = request.query.token;
    if (urlToken && typeof urlToken === 'string') {
      return urlToken;
    }

    return request.headers[CN_HIERARCHY_OBJECT_TOKEN_HEADER] as string;
  }
}
