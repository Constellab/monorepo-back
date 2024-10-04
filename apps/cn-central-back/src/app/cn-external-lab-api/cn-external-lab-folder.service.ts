import { Injectable } from '@nestjs/common';
import { CnExternalLabApiService } from './cn-external-lab-api.service';
import { lastValueFrom } from 'rxjs';
import { CnHierarchyObjectWithChildren } from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.entity';
import {
  CnFolderDtoHelper,
  CnLabFolderDTO
} from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.dto';
import { CnLabGlabApiInfo } from '../cn-lab-instances/cn-lab-instance.dto';
import { BlVersion } from '@monorepo/back-core-lib';


/**
 * Service to call route for lab in the lab instance
 */
@Injectable()
export class CnExternalLabFolderService {

  private readonly newRouteVersion: string = '0.10.0';
  private readonly oldRoute: string = 'project';
  private readonly route: string = 'project';

  constructor(private externalLabApiService: CnExternalLabApiService) {
  }

  public async addFolderInLab(glabApiInfo: CnLabGlabApiInfo, folderTree: CnHierarchyObjectWithChildren): Promise<void> {
    const labInfoDto: CnLabFolderDTO = CnFolderDtoHelper.convertToLabFolderDto(folderTree);
    return lastValueFrom(this.externalLabApiService.post(glabApiInfo.apiInfo, this.getRoute(glabApiInfo.gwsCoreVersion), labInfoDto));
  }

  public async deleteFolderInLab(glabApiInfo: CnLabGlabApiInfo, folderId: string): Promise<void> {
    return lastValueFrom(this.externalLabApiService.delete(glabApiInfo.apiInfo, `${this.getRoute(glabApiInfo.gwsCoreVersion)}/${folderId}`));
  }

  /**
   * Method to retrieve the correct route to call based on gws_core version
   * @param gwsCoreVersion
   * @private
   */
  private getRoute(gwsCoreVersion: BlVersion): string {
    const newRouteVersion = BlVersion.fromString(this.newRouteVersion);
    if (gwsCoreVersion.isEqualOrHigher(newRouteVersion)) {
      return this.route;
    }
    return this.oldRoute;
  }
}

