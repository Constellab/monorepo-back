import { Injectable } from '@nestjs/common';
import { CnExternalLabApiService } from './cn-external-lab-api.service';
import { CnExternalApiInfo } from '../cn-core/model/config/cn-config.class';
import { lastValueFrom } from 'rxjs';
import {
  CnFolderHierarchyWithChildren
} from '../cn-projects-aggregate/cn-folder-hierarchies/cn-folder-hierarchy.entity';

// class SpaceProject(BaseModelDTO):
//
//     id: str
//     code: str
//     title: str
//     children: Optional[List['SpaceProject']] = None
//     levelStatus: ProjectLevelStatus

class CnLabFolderDTO {
  id: string;
  code: string;
  title: string;
  children: CnLabFolderDTO[];
  levelStatus: 'LEAF' | 'PARENT';
}

/**
 * Service to call route for lab in the lab instance
 */
@Injectable()
export class CnExternalLabProjectService {

  private readonly route: string = 'project';

  constructor(private externalLabApiService: CnExternalLabApiService) {
  }

  public async addFolderInLab(labInfo: CnExternalApiInfo, folderTree: CnFolderHierarchyWithChildren): Promise<void> {
    const labInfoDto: CnLabFolderDTO = this.spaceFolderToLabFolder(folderTree);
    return lastValueFrom(this.externalLabApiService.post(labInfo, this.route, labInfoDto));
  }

  private spaceFolderToLabFolder(folder: CnFolderHierarchyWithChildren): CnLabFolderDTO {
    return {
      id: folder.id,
      code: folder.name, // TODO REMOVE THIS once all lab are update to v 0.10.0
      title: folder.name,
      children: folder.children.map(child => this.spaceFolderToLabFolder(child)),
      levelStatus: folder.children.length === 0 ? 'LEAF' : 'PARENT'
    }

  }

  public async deleteFolderInLab(labInfo: CnExternalApiInfo, folderId: string): Promise<void> {
    return lastValueFrom(this.externalLabApiService.delete(labInfo, `${this.route}/${folderId}`));
  }
}

