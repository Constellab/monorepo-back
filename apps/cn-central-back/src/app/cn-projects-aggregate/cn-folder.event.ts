import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { CnFolderHierarchy } from './cn-folder-hierarchies/cn-folder-hierarchy.entity';

export const cnProjectEventName = 'cn-project-event';

// special event call before a project is deleted to remove it from labs that uses it, to avoid circular dependencies
export const cnRemoveProjectFromAllLabsEventName = 'cn-remove-project-from-all-labs-event';

export type CnProjectEventType =
  'CREATE_ROOT_PROJECT'
  | 'CREATE_SUB_PROJECT'
  | 'UPDATE_PROJECT'
  | 'DELETE_PROJECT'
  | 'UPDATE_PROJECT_LEADER'
  | 'UPDATE_PROJECT_DESCRIPTION'
  | 'SHARE_PROJECT'
  | 'UNSHARE_PROJECT'
  | 'CREATE_EXPERIMENT'
  | 'UPDATE_EXPERIMENT'
  | 'DELETE_EXPERIMENT'
  | 'CREATE_REPORT'
  | 'UPDATE_REPORT'
  | 'DELETE_REPORT'
  | 'RENAME_DOCUMENT'
  | 'CREATE_CONSTELLAB_DOCUMENT'
  | 'UPDATE_CONSTELLAB_DOCUMENT'
  | 'UPLOAD_PROJECT_DOCUMENT'
  | 'MOVE_PROJECT_DOCUMENT_TO_TRASH'
  | 'RESTORE_PROJECT_DOCUMENT_FROM_TRASH'
  | 'DELETE_PROJECT_DOCUMENT'
  | 'CREATE_PROJECT_COMMENT'
  | 'UPDATE_PROJECT_COMMENT'
  | 'DELETE_PROJECT_COMMENT';


// TODO peut être splitter en 2 event, un qui n'a pas le parentFolder et un qui l'a
export interface CnFolderEvent {
  type: CnProjectEventType;
  parentFolder?: CnFolderHierarchy;
  entity: any;
  userInfo: CnUserSpaceInfo;
}

export interface CnFolderObjectEvent {
  type: CnProjectEventType;
  parentFolder: CnFolderHierarchy;
  entity: any;
  userInfo: CnUserSpaceInfo;
}
