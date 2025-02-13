import { CnLabGuard, CnLabRobotAuthentication } from '../cn-core/decorators/cn-lab-guard.decorator';
import { Controller, Get } from '@nestjs/common';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';

@CnLabGuard()
@Controller('external-community-labs')
export class CnExternalCommunityLabsController {
  /**
   * Verify rights of the lab user requesting Community based on the Api token and the user id
   */
  @Get('verify-rights')
  async verifyRights(): Promise<any> {
    return {
      labId: CnCurrentUserHelper.getAndCheckCurrentLab().id,
      userId: CnCurrentUserHelper.getAndCheckCurrentUser().id,
    };
  }

  /**
   * Verify rights of the lab requesting Community based on the
   * Api token without user id, mostly non-user based requests
   */
  @CnLabRobotAuthentication()
  @Get('verify-without-user-rights')
  async verifyWithoutUserRights(): Promise<any> {
    return {
      labId: CnCurrentUserHelper.getAndCheckCurrentLab().id,
    };
  }
}
