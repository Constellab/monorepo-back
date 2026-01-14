import { Controller, Delete, Param, ParseUUIDPipe } from '@nestjs/common';

import { CnUserDeletionAggregateService } from './cn-user-deletion-aggregate.service';

/**
 * Controller for user deletion operations
 */
@Controller('user-deletion')
export class CnUserDeletionAggregateController {
  constructor(private userDeletionAggregateService: CnUserDeletionAggregateService) {}

  @Delete(':userId')
  deleteUser(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.userDeletionAggregateService.deleteUser(userId);
  }
}
