import { Type } from 'class-transformer';
import { DateTime } from 'luxon';

import { CnTypeStyle } from '../../cn-core/model/config/cn-type-style.class';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnRootFolderUserRole } from '../cn-folder-user/cn-folder-user.entity';
import { CnTag } from '../cn-hierarchy-object-tags/cn-hierarchy-object-tag.dto';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
  CnHierarchyObjectType,
  CnHierarchyObjectWithChildren,
} from './cn-hierarchy-object.entity';

export interface CnHierarchyObjectInfo {
  objectType: CnHierarchyObjectType;
  name: string;
  user: CnUser;
  lastModifiedAt: DateTime;
  style: CnTypeStyle;
  isValidated?: boolean;
  documentSize?: number;
}

export class CnHierarchyObjectFindOneDTO {
  @Type(() => CnHierarchyObjectEntity)
  hierarchyObject: CnHierarchyObject;
  userRole: CnRootFolderUserRole;

  constructor(hierarchyObject: CnHierarchyObject, userRole: CnRootFolderUserRole) {
    this.hierarchyObject = hierarchyObject;
    this.userRole = userRole;
  }
}

/**
 * Representation of a folder in the lab
 */
export class CnLabFolderDTO {
  id!: string;
  code!: string;
  title!: string; // TODO remove once all lab are on v 0.13.0 or higher
  name!: string;
  children!: CnLabFolderDTO[];
  levelStatus!: 'LEAF' | 'PARENT';
}

export class CnBulkActionContext {
  selectedIds!: string[];
}

export class CnBulkMoveToFolderDto {
  context!: CnBulkActionContext;
  targetFolderId!: string;
}

export class CnBulkCreateTagsDto {
  context!: CnBulkActionContext;
  tags!: CnTag[];
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
