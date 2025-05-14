import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CnHierarchyObjectTokenService } from './cn-hierarchy-object-token.service';
import { Request } from 'express';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnAuthContextHierarchyObjectToken } from '../../cn-core/utils/cn-auth-context.class';
import { CnSpaceService } from '../../cn-spaces/cn-space.service';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';

@Injectable()
export class CnHierarchyObjectTokenGuard implements CanActivate {
  constructor(
    private hierarchyObjectTokenService: CnHierarchyObjectTokenService,
    private spaceService: CnSpaceService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = request.params.token;
    if (!token) {
      throw new BlUnauthorizedException('Invalid link');
    }

    const hierarchyObjectToken = await this.hierarchyObjectTokenService.findByToken(token);
    if (!hierarchyObjectToken || !hierarchyObjectToken.isValid()) {
      throw new BlUnauthorizedException('Invalid link');
    }

    const space = await this.spaceService.findByIdAndCheck(hierarchyObjectToken.hierarchyObject.spaceId);

    // set the auth context
    const authContext = new CnAuthContextHierarchyObjectToken(space, hierarchyObjectToken.hierarchyObject);
    CnCurrentUserHelper.setAuthContext(authContext);

    return true;
  }
}
