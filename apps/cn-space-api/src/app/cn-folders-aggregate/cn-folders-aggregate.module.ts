import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CnActivityModule } from '../cn-activity/cn-activity.module';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnExternalLabApiModule } from '../cn-external-lab-api/cn-external-lab-api.module';
import { CnNotificationModule } from '../cn-notification/cn-notification.module';
import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CnChatAggregateService } from './cn-chat/cn-chat-aggregate.service';
import { CnChatMessageModule } from './cn-chat/cn-chat-message.module';
import { CnChatController } from './cn-chat/cn-chat.controller';
import { CnConstellabDocumentAggregateService } from './cn-documents/cn-constellab-document.aggregate.service';
import { CnConstellabDocumentController } from './cn-documents/cn-constellab-document.controller';
import { CnDocumentAggregateService } from './cn-documents/cn-document-aggregate.service';
import { CnDocumentController } from './cn-documents/cn-document.controller';
import { CnDocumentModule } from './cn-documents/cn-document.module';
import { CnFolderAggregateService } from './cn-folder-aggregate.service';
import { CnFolderCopierService } from './cn-folder-copier.service';
import { CnFolderUserModule } from './cn-folder-user/cn-folder-user.module';
import { CnFolderEventService } from './cn-folder.event';
import { CnFolderListener } from './cn-folder.listener';
import { CnFoldersController } from './cn-folders.controller';
import { CnFoldersModule } from './cn-folders/cn-folders.module';
import { CnHierarchyObjectTagAggregateService } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag-aggregate.service';
import { CnHierarchyObjectTagModule } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag.module';
import { CnHierarchyObjectTokenAggregateService } from './cn-hierarchy-object-token/cn-hierarchy-object-token-aggregate.service';
import { CnHierarchyObjectTokenController } from './cn-hierarchy-object-token/cn-hierarchy-object-token.controller';
import { CnHierarchyObjectTokenModule } from './cn-hierarchy-object-token/cn-hierarchy-object-token.module';
import { CnHierarchyObjectAggregateService } from './cn-hierarchy-objects/cn-hierarchy-object-aggregate.service';
import { CnHierarchyObjectController } from './cn-hierarchy-objects/cn-hierarchy-object.controller';
import { CnHierarchyObjectModule } from './cn-hierarchy-objects/cn-hierarchy-object.module';
import { CnNoteAggregateService } from './cn-notes/cn-note-aggregate.service';
import { CnNotesController } from './cn-notes/cn-notes.controller';
import { CnNotesModule } from './cn-notes/cn-notes.module';
import { CnResourceAggregateService } from './cn-resources/cn-resource-aggregate.service';
import { CnResourcesModule } from './cn-resources/cn-resources.module';
import { CnScenarioAggregateService } from './cn-scenarios/cn-scenario-aggregate.service';
import { CnScenariosController } from './cn-scenarios/cn-scenarios.controller';
import { CnScenariosModule } from './cn-scenarios/cn-scenarios.module';
import { CnFoldersSecurityService } from './cn-security/cn-folders-security.service';

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
    CnDocumentAggregateService,
  ],
})
export class CnFoldersAggregateModule {}
