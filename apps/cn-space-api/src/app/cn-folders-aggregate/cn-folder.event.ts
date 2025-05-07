import { CnHierarchyObject } from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnSpace } from '../cn-spaces/cn-space.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';

export const cnFolderEventName = 'cn-folder-event';

// special event call before a folder is deleted to remove it from labs
// that uses it, to avoid circular dependencies
export const cnRemoveFolderFromAllLabsEventName = 'cn-remove-folder-from-all-labs-event';

export type CnFolderEventType =
  | 'CREATE_ROOT_FOLDER'
  | 'CREATE_SUB_FOLDER'
  | 'UPDATE_FOLDER'
  | 'UPDATE_FOLDER_LEADER'
  | 'UPDATE_FOLDER_DESCRIPTION'
  | 'SHARE_FOLDER'
  | 'UNSHARE_FOLDER'
  | 'MOVE_FOLDER'
  | 'UPLOAD_FOLDER'
  | 'MOVE_OBJECT_TO_FOLDER'
  | 'MOVE_OBJECT_TO_TRASH'
  | 'RESTORE_OBJECT_FROM_TRASH'
  | 'DELETE_OBJECT'
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
  | 'RENAME_RESOURCE'
  | 'EMPTY_TRASH';

export interface CnFolderEvent {
  type: CnFolderEventType;
  parentFolder?: CnHierarchyObject;
  entity: any;
  space: CnSpace;
  user: CnUser;
}

export interface CnFolderEventMoveFolderData {
  hierarchyObject: CnHierarchyObject;
  oldParentRootFolderId: string;
  newParentFolder: CnHierarchyObject;
}

@Injectable()
export class CnFolderEventService {
  constructor(private eventEmitter: EventEmitter2) {}

  public emitFolderEvent(eventType: CnFolderEventType, parentFolder: CnHierarchyObject, entity: any): void {
    const event: CnFolderEvent = {
      type: eventType,
      parentFolder: parentFolder,
      entity,
      user: CnCurrentUserHelper.getAndCheckCurrentUser(),
      space: CnCurrentUserHelper.getAndCheckCurrentSpace(),
    };
    this.eventEmitter.emit(cnFolderEventName, event);
  }
}
