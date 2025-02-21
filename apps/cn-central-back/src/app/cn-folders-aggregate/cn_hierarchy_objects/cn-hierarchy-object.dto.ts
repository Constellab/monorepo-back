import { CnHierarchyObjectType, CnHierarchyObjectWithChildren } from './cn-hierarchy-object.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { DateTime } from 'luxon';
import { CnTypeStyle } from '../../cn-core/model/config/cn-type-style.class';

export interface CnHierarchyObjectInfo {
  objectType: CnHierarchyObjectType;
  name: string;
  user: CnUser;
  lastModifiedAt: DateTime;
  style: CnTypeStyle;
  isValidated?: boolean;
  documentSize?: number;
  isVisible?: boolean;
}

/**
 * Representation of a folder in the lab
 */
export class CnLabFolderDTO {
  id: string;
  code: string;
  title: string; // TODO remove once all lab are on v 0.13.0 or higher
  name: string;
  children: CnLabFolderDTO[];
  levelStatus: 'LEAF' | 'PARENT';
}

export class CnFolderDtoHelper {
  public static convertToLabFolderDto(folder: CnHierarchyObjectWithChildren): CnLabFolderDTO {
    return {
      id: folder.id,
      code: folder.name,
      title: folder.name,
      name: folder.name,
      children: folder.children.map((child) => CnFolderDtoHelper.convertToLabFolderDto(child)),
      levelStatus: folder.children.length > 0 ? 'PARENT' : 'LEAF',
    };
  }

  public static convertToFolderTreeDtoList(folders: CnHierarchyObjectWithChildren[]): CnLabFolderDTO[] {
    return folders.map((folder) => CnFolderDtoHelper.convertToLabFolderDto(folder));
  }
}
