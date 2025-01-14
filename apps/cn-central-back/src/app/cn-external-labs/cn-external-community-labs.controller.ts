import { CnLabGuard, CnLabRobotAuthentication } from '../cn-core/decorators/cn-lab-guard.decorator';
import { Controller, Get } from '@nestjs/common';

@CnLabGuard()
@Controller('external-community-labs')
export class CnExternalCommunityLabsController {
  @Get('verify-rights')
  async verifyRights(): Promise<boolean> {
    return true;
  }

  @CnLabRobotAuthentication()
  @Get('verify-without-user-rights')
  async verifyWithoutUserRights(): Promise<boolean> {
    return true;
  }
}
