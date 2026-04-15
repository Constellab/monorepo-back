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
   * Verify that the provided lab API key is valid and that the user belongs to the lab.
   * Returns labId and userId.
   */
  @Get(['verify-lab-api-key', 'verify-rights'])
  verifyLabApiKey(): { labId: string; userId: string } {
    return {
      labId: CnCurrentUserHelper.getAndCheckCurrentLab().id,
      userId: CnCurrentUserHelper.getAndCheckCurrentUser().id,
    };
  }

  /**
   * Verify that the provided lab API key is valid without requiring a user.
   * Used for automated lab requests. Returns labId only.
   */
  @CnLabRobotAuthentication()
  @Get(['verify-lab-api-key-no-user', 'verify-without-user-rights'])
  verifyLabApiKeyWithoutUser(): { labId: string } {
    return {
      labId: CnCurrentUserHelper.getAndCheckCurrentLab().id,
    };
  }

  /**
   * Check if the lab has access to a specific private brick based on its lab config.
   */
  @CnLabRobotAuthentication()
  @Get(['check-lab-brick-access/:brickName', 'check-brick-access/:brickName'])
  async checkLabBrickAccess(@Param('brickName') brickName: string): Promise<{ hasAccess: boolean }> {
    const lab = CnCurrentUserHelper.getAndCheckCurrentLab();
    if (lab.labConfigId == null) {
      return { hasAccess: false };
    }
    const brickVersion = await this.labConfigsService.getLabBrickVersion(lab.labConfigId, brickName);
    return { hasAccess: brickVersion != null };
  }
}
