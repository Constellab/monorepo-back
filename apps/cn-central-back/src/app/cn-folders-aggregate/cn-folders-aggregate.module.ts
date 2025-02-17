import { Module } from '@nestjs/common';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnFoldersController } from './cn-folders.controller';
import { CnFolderAggregateService } from './cn-folder-aggregate.service';
import { CnFoldersSecurityService } from './cn-folders-security.service';
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
import { CnFolderCopierService } from './cn-folder-copier.service';
import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnResourcesModule } from './cn-resources/cn-resources.module';
import { CnResourcesController } from './cn-resources/cn-resources.controller';
import { CnExternalLabApiModule } from '../cn-external-lab-api/cn-external-lab-api.module';
import { CnHierarchyObjectTagModule } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag.module';
import { CnHierarchyObjectController } from './cn_hierarchy_objects/cn-hierarchy-object.controller';
import { CnHierarchyObjectListener } from './cn-hierarchy-object.listener';

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
    CnSpacesModule,
    CnResourcesModule,
    CnHierarchyObjectTagModule,

    CnUsersModule,
    CnNotificationModule,
    CnActivityModule,
    CnExternalLabApiModule,

    EventEmitterModule,
  ],
  controllers: [
    CnFoldersController,
    CnScenariosController,
    CnNotesController,
    CnResourcesController,
    CnHierarchyObjectController,
  ],
  providers: [
    CnFoldersSecurityService,
    CnFolderAggregateService,
    CnFolderListener,
    CnFolderCopierService,
    CnHierarchyObjectListener,
  ],
  exports: [CnFoldersSecurityService, CnFolderAggregateService],
})
export class CnFoldersAggregateModule {}
