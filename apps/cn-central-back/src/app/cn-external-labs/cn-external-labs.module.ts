import { Module } from '@nestjs/common';
import { CnExternalLabsController } from './cn-external-labs.controller';
import { CnLabsModule } from '../cn-labs/cn-labs.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnFoldersAggregateModule } from '../cn-folders-aggregate/cn-folders-aggregate.module';
import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnExternalLabsManagerController } from './cn-external-labs-manager.controller';
import { CnLabFolderAggregateModule } from '../cn-lab-folder-aggregate/cn-lab-folder-aggregate.module';

/**
 * Module for incoming calls from the labs
 */
@Module({
  controllers: [CnExternalLabsController, CnExternalLabsManagerController],
  imports: [
    CnCoreModule,

    CnLabsModule,
    CnFoldersAggregateModule,
    CnLabFolderAggregateModule,

    CnUsersModule, // used by the lab auth guard
    CnSpacesModule, // used by the lab auth guard
  ],
})
export class CnExternalLabsModule {}
