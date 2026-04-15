import { Controller, Get, Param } from '@nestjs/common';

import { CnCommunityGuard } from '../cn-core/decorators/cn-community-guard.decorator';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnUsersService } from '../cn-users/cn-users.service';

/**
 * Controller for incoming calls from the Community API.
 * Authenticated via the COMMUNITY_API_KEY (X-Api-Key header).
 */
@CnCommunityGuard()
@Controller('external-community')
export class CnExternalCommunityController {
  constructor(private readonly usersService: CnUsersService) {}

  /**
   * Check if a user exists and is valid (status READY) in the Space API.
   * Called by the Community API to verify user status.
   */
  @Get('check-user/:userId')
  checkUserValid(@Param('userId') userId: string): Promise<CnUser> {
    return this.usersService.findOneValid(userId);
  }
}
