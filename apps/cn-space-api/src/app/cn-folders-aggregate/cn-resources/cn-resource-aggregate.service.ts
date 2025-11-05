import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CnFolderEventService } from '../cn-folder.event';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from '../cn-hierarchy-objects/cn-hierarchy-object.service';
import { CnFoldersSecurityService } from '../cn-security/cn-folders-security.service';
import { CnShareResourceRequestDTO } from './cn-resource.dto';
import { CnResource, CnResourceWithLab } from './cn-resource.entity';
import { CnResourcesService } from './cn-resources.service';

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
  ): Promise<CnHierarchyObject> {
    const parentFolder = await this.securityService.getAndCheckAuthorizationForUpdate(parentFolderId);

    const resource = await this.resourceService.saveResource(parentFolder, requestDTO);

    if (resource.mode === 'create') {
      this.eventService.emitFolderEvent({
        type: 'CREATE_RESOURCE',
        entity: resource.resource,
        parentFolder: parentFolder,
      });
    } else {
      this.eventService.emitFolderEvent({
        type: 'UPDATE_RESOURCE',
        entity: resource.resource,
        parentFolder: parentFolder,
      });
    }

    return this.hierarchyObjectService.findByIdAndCheck(resource.resource.id);
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

    this.eventService.emitFolderEvent({
      type: 'RENAME_RESOURCE',
      entity: resource,
      parentFolder: await this.hierarchyObjectService.findByIdAndCheck(hierarchyObject.parentId),
    });

    return resource;
  }
}
