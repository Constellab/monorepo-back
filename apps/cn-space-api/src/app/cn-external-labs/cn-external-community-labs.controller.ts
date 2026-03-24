import { Controller, Get, Param } from '@nestjs/common';

import {
  CnLabAllowDev,
  CnLabGuard,
  CnLabRobotAuthentication,
} from '../cn-core/decorators/cn-lab-guard.decorator';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnLabConfigsService } from '../cn-lab-configs/cn-lab-configs.service';

@CnLabGuard()
@CnLabAllowDev()
@Controller('external-community-labs')
export class CnExternalCommunityLabsController {
  constructor(private readonly labConfigsService: CnLabConfigsService) {}

  /**
   * Verify rights of the lab user requesting Community based on the Api token and the user id
   */
  @Get('verify-rights')
  verifyRights(): any {
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
  verifyWithoutUserRights(): { labId: string } {
    return {
      labId: CnCurrentUserHelper.getAndCheckCurrentLab().id,
    };
  }

  /**
   * Check if the lab has access to a specific brick based on its lab config
   */
  @CnLabRobotAuthentication()
  @Get('check-brick-access/:brickName')
  async checkBrickAccessByName(@Param('brickName') brickName: string): Promise<{ hasAccess: boolean }> {
    const lab = CnCurrentUserHelper.getAndCheckCurrentLab();
    if (lab.labConfigId == null) {
      return { hasAccess: false };
    }
    const brickVersion = await this.labConfigsService.getLabBrickVersion(lab.labConfigId, brickName);
    return { hasAccess: brickVersion != null };
  }

  /**
   * Check if the lab has access to a specific brick version based on its lab config
   */
  @CnLabRobotAuthentication()
  @Get('check-brick-access/:brickName/:version')
  async checkBrickAccess(
    @Param('brickName') brickName: string,
    @Param('version') version: string
  ): Promise<{ hasAccess: boolean }> {
    const lab = CnCurrentUserHelper.getAndCheckCurrentLab();
    if (lab.labConfigId == null) {
      return { hasAccess: false };
    }
    const brickVersion = await this.labConfigsService.getLabBrickVersion(lab.labConfigId, brickName);
    if (brickVersion == null) {
      return { hasAccess: false };
    }
    return { hasAccess: brickVersion.version.toString() === version };
  }
}
