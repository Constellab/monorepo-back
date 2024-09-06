import { CnFolderHierarchyWithChildren } from './cn-folder-hierarchy.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { DateTime } from 'luxon';


export interface CnFolderHierarchyInfo {
  name: string;
  user: CnUser;
  lastModifiedAt: DateTime;
  isValidated?: boolean;
  documentSize?: number;
}

/**
 * Representation of a folder in the lab
 */
export class CnLabFolderDTO {
  id: string;
  code: string;
  title: string;
  children: CnLabFolderDTO[];
  levelStatus: 'LEAF' | 'PARENT';
}

export class CnFolderDtoHelper {

  public static convertToLabFolderDto(folder: CnFolderHierarchyWithChildren): CnLabFolderDTO {
    return {
      id: folder.id,
      code: folder.name,
      title: folder.name,
      children: folder.children.map(child => CnFolderDtoHelper.convertToLabFolderDto(child)),
      levelStatus: folder.children.length > 0 ? 'PARENT' : 'LEAF'
    };
  }

  public static convertToFolderTreeDtoList(folders: CnFolderHierarchyWithChildren[]): CnLabFolderDTO[] {
    return folders.map(project => CnFolderDtoHelper.convertToLabFolderDto(project));
  }

}
