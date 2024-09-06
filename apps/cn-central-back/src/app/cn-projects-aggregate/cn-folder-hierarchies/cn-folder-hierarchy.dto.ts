import { CnProjectLevelStatus } from '../cn-projects/cn-project-level.enum';
import { CnFolderHierarchyEntity } from './cn-folder-hierarchy.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { DateTime } from 'luxon';


export interface CnFolderHierarchyInfo{
  name: string;
  user: CnUser;
  lastModifiedAt: DateTime;
  isValidated?: boolean;
  documentSize?: number;
}

export interface CnFolderTreeDTO {
  id: string;
  code: string;
  title: string;
  children: CnFolderTreeDTO[];
  levelStatus: CnProjectLevelStatus;
}

export class CnFolderDtoHelper {

  // TODO improve type
  public static convertToFolderTreeDto(folder: CnFolderHierarchyEntity): CnFolderTreeDTO {
    return {
      id: folder.id,
      code: folder.name, // TODO a changer
      title: folder.name,
      children: folder.children.map(child => CnFolderDtoHelper.convertToFolderTreeDto(child)),
      levelStatus: null // TODO a changer
    };
  }

  public static convertToFolderTreeDtoList(folders: CnFolderHierarchyEntity[]): CnFolderTreeDTO[] {
    return folders.map(project => CnFolderDtoHelper.convertToFolderTreeDto(project));
  }

}
