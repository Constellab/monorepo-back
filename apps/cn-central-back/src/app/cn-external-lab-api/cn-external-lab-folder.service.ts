import { Injectable } from '@nestjs/common';
import { CnExternalLabApiService } from './cn-external-lab-api.service';
import { CnExternalApiInfo } from '../cn-core/model/config/cn-config.class';
import { lastValueFrom } from 'rxjs';
import {
  CnHierarchyObjectWithChildren
} from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.entity';
import {
  CnFolderDtoHelper,
  CnLabFolderDTO
} from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.dto';


/**
 * Service to call route for lab in the lab instance
 */
@Injectable()
export class CnExternalLabFolderService {

  private readonly route: string = 'project';

  constructor(private externalLabApiService: CnExternalLabApiService) {
  }

  public async addFolderInLab(labInfo: CnExternalApiInfo, folderTree: CnHierarchyObjectWithChildren): Promise<void> {
    const labInfoDto: CnLabFolderDTO = CnFolderDtoHelper.convertToLabFolderDto(folderTree);
    return lastValueFrom(this.externalLabApiService.post(labInfo, this.route, labInfoDto));
  }

  public async deleteFolderInLab(labInfo: CnExternalApiInfo, folderId: string): Promise<void> {
    return lastValueFrom(this.externalLabApiService.delete(labInfo, `${this.route}/${folderId}`));
  }
}

