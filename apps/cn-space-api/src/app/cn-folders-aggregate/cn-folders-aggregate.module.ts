import { Module } from '@nestjs/common';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnFoldersController } from './cn-folders.controller';
import { CnFoldersSecurityService } from './cn-security/cn-folders-security.service';
import { CnScenariosModule } from './cn-scenarios/cn-scenarios.module';
import { CnNotesModule } from './cn-notes/cn-notes.module';
import { CnScenariosController } from './cn-scenarios/cn-scenarios.controller';
import { CnNotesController } from './cn-notes/cn-notes.controller';
import { CnFoldersModule } from './cn-folders/cn-folders.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CnChatMessageModule } from './cn-chat/cn-chat-message.module';
import { CnFolderListener } from './cn-folder.listener';
import { CnFolderUserModule } from './cn-folder-user/cn-folder-user.module';
import { CnNotificationModule } from '../cn-notification/cn-notification.module';
import { CnActivityModule } from '../cn-activity/cn-activity.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CnDocumentModule } from './cn-documents/cn-document.module';
import { CnHierarchyObjectModule } from './cn-hierarchy-objects/cn-hierarchy-object.module';
import { CnFolderCopierService } from './cn-folder-copier.service';
import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnResourcesModule } from './cn-resources/cn-resources.module';
import { CnExternalLabApiModule } from '../cn-external-lab-api/cn-external-lab-api.module';
import { CnHierarchyObjectTagModule } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag.module';
import { CnHierarchyObjectController } from './cn-hierarchy-objects/cn-hierarchy-object.controller';
import { CnChatAggregateService } from './cn-chat/cn-chat-aggregate.service';
import { CnConstellabDocumentAggregateService } from './cn-documents/cn-constellab-document.aggregate.service';
import { CnDocumentAggregateService } from './cn-documents/cn-document-aggregate.service';
import { CnHierarchyObjectAggregateService } from './cn-hierarchy-objects/cn-hierarchy-object-aggregate.service';
import { CnNoteAggregateService } from './cn-notes/cn-note-aggregate.service';
import { CnResourceAggregateService } from './cn-resources/cn-resource-aggregate.service';
import { CnScenarioAggregateService } from './cn-scenarios/cn-scenario-aggregate.service';
import { CnChatController } from './cn-chat/cn-chat.controller';
import { CnConstellabDocumentController } from './cn-documents/cn-constellab-document.controller';
import { CnDocumentController } from './cn-documents/cn-document.controller';
import { CnFolderEventService } from './cn-folder.event';
import { CnHierarchyObjectTagAggregateService } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag-aggregate.service';
import { CnHierarchyObjectTokenAggregateService } from './cn-hierarchy-object-token/cn-hierarchy-object-token-aggregate.service';
import { CnHierarchyObjectTokenController } from './cn-hierarchy-object-token/cn-hierarchy-object-token.controller';
import { CnFolderAggregateService } from './cn-folder-aggregate.service';
import { CnHierarchyObjectTokenModule } from './cn-hierarchy-object-token/cn-hierarchy-object-token.module';

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
    CnHierarchyObjectTokenModule,

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
    CnHierarchyObjectController,
    CnChatController,
    CnConstellabDocumentController,
    CnDocumentController,
    CnHierarchyObjectTokenController,
  ],
  providers: [
    CnFoldersSecurityService,
    CnFolderAggregateService,
    CnFolderListener,
    CnFolderCopierService,
    CnChatAggregateService,
    CnConstellabDocumentAggregateService,
    CnDocumentAggregateService,
    CnHierarchyObjectAggregateService,
    CnNoteAggregateService,
    CnResourceAggregateService,
    CnScenarioAggregateService,
    CnHierarchyObjectTagAggregateService,
    CnHierarchyObjectTokenAggregateService,
    CnFolderEventService,
  ],
  exports: [
    CnFoldersSecurityService,
    CnFolderAggregateService,
    CnHierarchyObjectAggregateService,
    CnResourceAggregateService,
    CnScenarioAggregateService,
    CnNoteAggregateService,
  ],
})
export class CnFoldersAggregateModule {}
