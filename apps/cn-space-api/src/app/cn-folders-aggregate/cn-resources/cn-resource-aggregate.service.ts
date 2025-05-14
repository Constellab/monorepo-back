import { Injectable } from '@nestjs/common';
import { CnResourcesService } from './cn-resources.service';
import { CnShareResourceRequestDTO } from './cn-resource.dto';
import { CnResource, CnResourceWithLab } from './cn-resource.entity';
import { CnFoldersSecurityService } from '../cn-security/cn-folders-security.service';
import { DataSource } from 'typeorm';
import { CnHierarchyObjectService } from '../cn-hierarchy-objects/cn-hierarchy-object.service';
import { CnFolderEventService } from '../cn-folder.event';

@Injectable()
export class CnResourceAggregateService {
  constructor(
    private resourceService: CnResourcesService,
    private hierarchyObjectService: CnHierarchyObjectService,
    private securityService: CnFoldersSecurityService,
    private eventService: CnFolderEventService,
    private datasource: DataSource
  ) {}

  public async shareResourceToFolder(
    parentFolderId: string,
    requestDTO: CnShareResourceRequestDTO
  ): Promise<void> {
    const parentFolder = await this.securityService.getAndCheckAuthorizationForUpdate(parentFolderId);

    await this.resourceService.saveResource(parentFolder, requestDTO);
  }

  public async deleteResource(resourceId: string): Promise<boolean> {
    await this.datasource.transaction(async (entityManager) => {
      await this.resourceService.deleteById(resourceId, entityManager);
      await this.hierarchyObjectService.deleteById(resourceId, entityManager);
    });
    return true;
  }

  public async findResource(resourceId: string): Promise<CnResourceWithLab> {
    await this.securityService.getAndCheckAuthorizationForFindOne(resourceId);
    return await this.resourceService.findWithLabByIdAndCheck(resourceId);
  }

  public async renameResource(resourceId: string, name: string): Promise<CnResource> {
    const hierarchyObject = await this.securityService.getAndCheckAuthorizationForUpdate(resourceId);
    const resource = await this.resourceService.renameResource(resourceId, name);

    this.eventService.emitFolderEvent(
      'RENAME_RESOURCE',
      await this.hierarchyObjectService.findByIdAndCheck(hierarchyObject.parentId),
      resource
    );

    return resource;
  }
}
