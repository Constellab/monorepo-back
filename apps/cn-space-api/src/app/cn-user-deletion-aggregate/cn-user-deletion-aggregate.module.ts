import { BL_TRANSPORT_SPACE_USER_QUEUE } from '@monorepo/back-core-lib';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { CnActivityModule } from '../cn-activity/cn-activity.module';
import { CnFoldersAggregateModule } from '../cn-folders-aggregate/cn-folders-aggregate.module';
import { CnHierarchyObjectModule } from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.module';
import { CnGroupsModule } from '../cn-groups/cn-groups.module';
import { CnNotificationModule } from '../cn-notification/cn-notification.module';
import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CnUserDeletionAggregateController } from './cn-user-deletion-aggregate.controller';
import { CnUserDeletionAggregateService } from './cn-user-deletion-aggregate.service';

/**
 * Aggregate module for user deletion operations
 * This module coordinates deletion across multiple domains: folders, spaces, groups, and users
 */
@Module({
  imports: [
    CnUsersModule,
    CnFoldersAggregateModule,
    CnSpacesModule,
    CnGroupsModule,
    CnActivityModule,
    CnHierarchyObjectModule,
    CnNotificationModule,
    BullModule.registerQueue({
      name: BL_TRANSPORT_SPACE_USER_QUEUE,
    }),
  ],
  controllers: [CnUserDeletionAggregateController],
  providers: [CnUserDeletionAggregateService],
  exports: [CnUserDeletionAggregateService],
})
export class CnUserDeletionAggregateModule {}
