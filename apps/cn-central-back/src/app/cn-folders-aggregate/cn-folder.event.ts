import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { CnHierarchyObject } from './cn_hierarchy_objects/cn-hierarchy-object.entity';

export const cnFolderEventName = 'cn-folder-event';

// special event call before a folder is deleted to remove it from labs
// that uses it, to avoid circular dependencies
export const cnRemoveFolderFromAllLabsEventName = 'cn-remove-folder-from-all-labs-event';

export type CnFolderEventType =
  | 'CREATE_ROOT_FOLDER'
  | 'CREATE_SUB_FOLDER'
  | 'UPDATE_FOLDER'
  | 'DELETE_FOLDER'
  | 'UPDATE_FOLDER_LEADER'
  | 'UPDATE_FOLDER_DESCRIPTION'
  | 'SHARE_FOLDER'
  | 'UNSHARE_FOLDER'
  | 'MOVE_FOLDER'
  | 'CREATE_SCENARIO'
  | 'UPDATE_SCENARIO'
  | 'DELETE_SCENARIO'
  | 'CREATE_NOTE'
  | 'UPDATE_NOTE'
  | 'DELETE_NOTE'
  | 'RENAME_DOCUMENT'
  | 'CREATE_CONSTELLAB_DOCUMENT'
  | 'UPDATE_CONSTELLAB_DOCUMENT'
  | 'UPLOAD_FOLDER_DOCUMENT'
  | 'MOVE_FOLDER_DOCUMENT_TO_TRASH'
  | 'RESTORE_FOLDER_DOCUMENT_FROM_TRASH'
  | 'DELETE_FOLDER_DOCUMENT'
  | 'CREATE_FOLDER_MESSAGE'
  | 'UPDATE_FOLDER_MESSAGE'
  | 'DELETE_FOLDER_MESSAGE'
  | 'RENAME_RESOURCE';

export interface CnFolderEvent {
  type: CnFolderEventType;
  parentFolder?: CnHierarchyObject;
  entity: any;
  userInfo: CnUserSpaceInfo;
}

export interface CnFolderEventMoveFolderData {
  hierarchyObject: CnHierarchyObject;
  oldParentRootFolderId: string;
  newParentFolder: CnHierarchyObject;
}
