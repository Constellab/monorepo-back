import { TeRichText } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnSpace } from '../cn-spaces/cn-space.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnChatMessage } from './cn-chat/cn-chat-message.entity';
import { CnDocument } from './cn-documents/cn-document.entity';
import { CnFolderUser } from './cn-folder-user/cn-folder-user.entity';
import { CnFolder } from './cn-folders/cn-folder.entity';
import { CnHierarchyObject } from './cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnNote } from './cn-notes/cn-note.entity';
import { CnResource } from './cn-resources/cn-resource.entity';
import { CnScenario } from './cn-scenarios/cn-scenario.entity';

export const cnFolderEventName = 'cn-folder-event';

// special event call before a folder is deleted to remove it from labs
// that uses it, to avoid circular dependencies
export const cnRemoveFolderFromAllLabsEventName = 'cn-remove-folder-from-all-labs-event';

export type CnFolderEventType =
  | 'CREATE_ROOT_FOLDER'
  | 'CREATE_SUB_FOLDER'
  | 'UPDATE_FOLDER'
  | 'UPDATE_FOLDER_DESCRIPTION'
  | 'SHARE_FOLDER'
  | 'UNSHARE_FOLDER'
  | 'UPDATE_FOLDER_USER_ROLE'
  | 'UPLOAD_FOLDER'
  | 'MOVE_OBJECT_TO_FOLDER'
  | 'MOVE_OBJECT_TO_TRASH'
  | 'RESTORE_OBJECT_FROM_TRASH'
  | 'DELETE_OBJECT'
  | 'OBJECT_TAG_MODIFIED'
  | 'CREATE_SCENARIO'
  | 'UPDATE_SCENARIO'
  | 'CREATE_NOTE'
  | 'UPDATE_NOTE'
  | 'RENAME_DOCUMENT'
  | 'CREATE_CONSTELLAB_DOCUMENT'
  | 'UPDATE_CONSTELLAB_DOCUMENT'
  | 'UPLOAD_FOLDER_DOCUMENT'
  | 'CREATE_FOLDER_MESSAGE'
  | 'UPDATE_FOLDER_MESSAGE'
  | 'DELETE_FOLDER_MESSAGE'
  | 'CREATE_RESOURCE'
  | 'UPDATE_RESOURCE'
  | 'RENAME_RESOURCE'
  | 'EMPTY_TRASH';

export interface CnFolderEventMoveObjectToFolderData {
  hierarchyObject: CnHierarchyObject;
  oldParentRootFolderId: string;
  newParentFolder: CnHierarchyObject;
}

// Payload types grouped by entity type and parentFolder requirement

// Folder events without parentFolder
type CnFolderEventPayloadRootFolder = {
  type: 'CREATE_ROOT_FOLDER';
  entity: CnFolder;
  parentFolder?: null;
};

type CnFolderEventPayloadUpdateFolder = {
  type: 'UPDATE_FOLDER';
  entity: CnFolder;
  folderHierarchyObject: CnHierarchyObject;
  parentFolder?: null;
};

// Folder events with parentFolder
type CnFolderEventPayloadSubFolder = {
  type: 'CREATE_SUB_FOLDER';
  entity: CnFolder;
  parentFolder: CnHierarchyObject;
};

// Description events without parentFolder
type CnFolderEventPayloadDescription = {
  type: 'UPDATE_FOLDER_DESCRIPTION';
  entity: TeRichText;
  parentFolder?: null;
};

// Folder user events with parentFolder
type CnFolderEventPayloadFolderUsers =
  | {
      type: 'SHARE_FOLDER';
      entity: CnUser[];
      parentFolder: CnHierarchyObject;
    }
  | {
      type: 'UNSHARE_FOLDER';
      entity: CnUser;
      parentFolder: CnHierarchyObject;
    }
  | {
      type: 'UPDATE_FOLDER_USER_ROLE';
      entity: CnFolderUser;
      parentFolder: CnHierarchyObject;
    };

// Document events with parentFolder
type CnFolderEventPayloadDocument = {
  type:
    | 'UPLOAD_FOLDER_DOCUMENT'
    | 'RENAME_DOCUMENT'
    | 'CREATE_CONSTELLAB_DOCUMENT'
    | 'UPDATE_CONSTELLAB_DOCUMENT';
  entity: CnDocument;
  parentFolder: CnHierarchyObject;
};

// Scenario events with parentFolder
type CnFolderEventPayloadScenario = {
  type: 'CREATE_SCENARIO' | 'UPDATE_SCENARIO';
  entity: CnScenario;
  parentFolder: CnHierarchyObject;
};

// Note events with parentFolder
type CnFolderEventPayloadNote = {
  type: 'CREATE_NOTE' | 'UPDATE_NOTE';
  entity: CnNote;
  parentFolder: CnHierarchyObject;
};

// Chat message events with parentFolder
type CnFolderEventPayloadChatMessage = {
  type: 'CREATE_FOLDER_MESSAGE' | 'UPDATE_FOLDER_MESSAGE' | 'DELETE_FOLDER_MESSAGE';
  entity: CnChatMessage;
  parentFolder: CnHierarchyObject;
};

// Resource events with parentFolder
type CnFolderEventPayloadResource = {
  type: 'CREATE_RESOURCE' | 'UPDATE_RESOURCE' | 'RENAME_RESOURCE';
  entity: CnResource;
  parentFolder: CnHierarchyObject;
};

// Hierarchy object events with parentFolder
type CnFolderEventPayloadHierarchyObject = {
  type:
    'UPLOAD_FOLDER' | 'MOVE_OBJECT_TO_TRASH' | 'RESTORE_OBJECT_FROM_TRASH' | 'DELETE_OBJECT' | 'EMPTY_TRASH';
  entity: CnHierarchyObject;
  parentFolder: CnHierarchyObject | null;
};

// Hierarchy object events without parentFolder
type CnFolderEventPayloadHierarchyObjectNoParent = {
  type: 'OBJECT_TAG_MODIFIED';
  entity: CnHierarchyObject;
  parentFolder?: null;
};

// Move event with special structure
type CnFolderEventPayloadMove = {
  type: 'MOVE_OBJECT_TO_FOLDER';
  entity: CnFolderEventMoveObjectToFolderData;
  parentFolder: CnHierarchyObject;
};

// Union of all payload types
export type CnFolderEventPayload =
  | CnFolderEventPayloadRootFolder
  | CnFolderEventPayloadUpdateFolder
  | CnFolderEventPayloadSubFolder
  | CnFolderEventPayloadDescription
  | CnFolderEventPayloadFolderUsers
  | CnFolderEventPayloadDocument
  | CnFolderEventPayloadScenario
  | CnFolderEventPayloadNote
  | CnFolderEventPayloadChatMessage
  | CnFolderEventPayloadResource
  | CnFolderEventPayloadHierarchyObject
  | CnFolderEventPayloadHierarchyObjectNoParent
  | CnFolderEventPayloadMove;

export interface CnFolderEvent {
  payload: CnFolderEventPayload;
  space: CnSpace;
  user: CnUser;
}

@Injectable()
export class CnFolderEventService {
  constructor(private eventEmitter: EventEmitter2) {}

  public emitFolderEvent(payload: CnFolderEventPayload): void {
    const event: CnFolderEvent = {
      payload,
      user: CnCurrentUserHelper.getAndCheckCurrentUser(),
      space: CnCurrentUserHelper.getAndCheckCurrentSpace(),
    };
    this.eventEmitter.emit(cnFolderEventName, event);
  }
}
