import { Module } from '@nestjs/common';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnFoldersController } from './cn-folders.controller';
import { CnFolderAggregateService } from './cn-folder-aggregate.service';
import { CnFoldersAggregateSecurity } from './cn-folders-aggregate-security.service';
import { CnScenariosModule } from './cn-scenarios/cn-scenarios.module';
import { CnNotesModule } from './cn-notes/cn-notes.module';
import { CnScenariosController } from './cn-scenarios/cn-scenarios.controller';
import { CnNotesController } from './cn-notes/cn-notes.controller';
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

    CnScenariosModule,
    CnNotesModule,
    CnDocumentModule,

    CnUsersModule,
    CnNotificationModule,
    CnActivityModule,

    EventEmitterModule,
  ],
  controllers: [CnFoldersController, CnScenariosController, CnNotesController],
  providers: [CnFoldersAggregateSecurity, CnFolderAggregateService, CnFolderListener],
  exports: [CnFoldersAggregateSecurity, CnFolderAggregateService],
})
export class CnFoldersAggregateModule {}
