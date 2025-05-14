import { Injectable } from '@nestjs/common';
import { CnExternalLabApiService } from './cn-external-lab-api.service';
import { lastValueFrom } from 'rxjs';
import { CnHierarchyObjectWithChildren } from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.entity';
import {
  CnFolderDtoHelper,
  CnLabFolderDTO,
} from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.dto';
import { CnLabGlabApiInfo } from '../cn-labs/cn-lab.dto';
import { BlBadRequestException, BlVersion } from '@monorepo/back-core-lib';

/**
 * Service to call route for lab in the lab
 */
@Injectable()
export class CnExternalLabFolderService {
  private readonly newRouteVersion: string = '0.10.0';
  private readonly syncFolderRouteVersion: string = '0.12.2';
  private readonly oldRoute: string = 'project';
  private readonly route: string = 'folder';

  constructor(private externalLabApiService: CnExternalLabApiService) {}

  public async addFolderInLab(
    glabApiInfo: CnLabGlabApiInfo,
    rootFolderTree: CnHierarchyObjectWithChildren
  ): Promise<void> {
    const labInfoDto: CnLabFolderDTO = CnFolderDtoHelper.convertToLabFolderDto(rootFolderTree);
    return lastValueFrom(
      this.externalLabApiService.post(
        glabApiInfo.apiInfo,
        this.getRoute(glabApiInfo.gwsCoreVersion),
        labInfoDto
      )
    );
  }

  public async deleteFolderInLab(glabApiInfo: CnLabGlabApiInfo, folderId: string): Promise<void> {
    return lastValueFrom(
      this.externalLabApiService.delete(
        glabApiInfo.apiInfo,
        `${this.getRoute(glabApiInfo.gwsCoreVersion)}/${folderId}`
      )
    );
  }

  public async syncAllFoldersInLab(
    glabApiInfo: CnLabGlabApiInfo,
    rootFolders: CnHierarchyObjectWithChildren[]
  ): Promise<void> {
    const requiredVersion = BlVersion.fromString(this.syncFolderRouteVersion);

    if (glabApiInfo.gwsCoreVersion.isLower(requiredVersion)) {
      throw new BlBadRequestException(
        `The lab version is too old to sync all folders. ` +
          `Please update the lab to version ${requiredVersion} or more`
      );
    }

    const labInfoDto: CnLabFolderDTO[] = rootFolders.map(CnFolderDtoHelper.convertToLabFolderDto);
    return lastValueFrom(
      this.externalLabApiService.post(glabApiInfo.apiInfo, `${this.route}/sync`, { folders: labInfoDto })
    );
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
