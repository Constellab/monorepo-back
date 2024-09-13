import { Module } from '@nestjs/common';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnFoldersController } from './cn-folders.controller';
import { CnFolderAggregateService } from './cn-folder-aggregate.service';
import { CnFoldersAggregateSecurity } from './cn-folders-aggregate-security.service';
import { CnExperimentsModule } from './cn-experiments/cn-experiments.module';
import { CnReportsModule } from './cn-reports/cn-reports.module';
import { CnExperimentsController } from './cn-experiments/cn-experiments.controller';
import { CnReportsController } from './cn-reports/cn-reports.controller';
import { CnFoldersModule } from './cn-folders/cn-folders.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CnChatMessageModule } from '../cn-chat-message/cn-chat-message.module';
import { CnFolderListener } from './cn-folder.listener';
import { CnFolderUserModule } from './cn-folder-user/cn-folder-user.module';
import { CnNotificationModule } from '../cn-notification/cn-notification.module';
import { CnActivityModule } from '../cn-activity/cn-activity.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CnDocumentModule } from './cn-documents/cn-document.module';
import { CnHierarchyObjectModule } from './cn_hierarchy_objects/cn-hierarchy-object.module';

@Module({
  imports: [
    CnCoreModule,

    CnFoldersModule,
    CnChatMessageModule,
    CnFolderUserModule,
    CnHierarchyObjectModule,

    CnExperimentsModule,
    CnReportsModule,
    CnDocumentModule,

    CnUsersModule,
    CnNotificationModule,
    CnActivityModule,

    EventEmitterModule,
  ],
  controllers: [
    CnFoldersController,
    CnExperimentsController,
    CnReportsController,
  ],
  providers: [
    CnFoldersAggregateSecurity,
    CnFolderAggregateService,
    CnFolderListener,
  ],
  exports: [
    CnFoldersAggregateSecurity,
    CnFolderAggregateService
  ]
})
export class CnFoldersAggregateModule {
}
