import { Module } from '@nestjs/common';

import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnFoldersAggregateModule } from '../cn-folders-aggregate/cn-folders-aggregate.module';
import { CnGroupsModule } from '../cn-groups/cn-groups.module';
import { CnLabConfigsModule } from '../cn-lab-configs/cn-lab-configs.module';
import { CnLabFolderAggregateModule } from '../cn-lab-folder-aggregate/cn-lab-folder-aggregate.module';
import { CnLabsModule } from '../cn-labs/cn-labs.module';
import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CnExternalCommunityLabsController } from './cn-external-community-labs.controller';
import { CnExternalDatahubController } from './cn-external-datahub.controller';
import { CnExternalLabsController } from './cn-external-labs.controller';
import { CnExternalLabsManagerController } from './cn-external-labs-manager.controller';

/**
 * Module for incoming calls from the labs
 */
@Module({
  controllers: [
    CnExternalLabsController,
    CnExternalDatahubController,
    CnExternalLabsManagerController,
    CnExternalCommunityLabsController,
  ],
  imports: [
    CnCoreModule,

    CnLabsModule,
    CnLabConfigsModule,
    CnFoldersAggregateModule,
    CnLabFolderAggregateModule,
    CnGroupsModule,

    CnUsersModule, // used by the lab auth guard
    CnSpacesModule, // used by the lab auth guard
  ],
})
export class CnExternalLabsModule {}
