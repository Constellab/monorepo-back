import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CnResource, CnResourceEntity, CnResourceWithLab } from './cn-resource.entity';
import { BlAbstractService } from '@monorepo/back-core-lib';
import { CnShareResourceRequestDTO } from './cn-resource.dto';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
} from '../cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { ClDateHelper } from '@monorepo/core-lib';

@Injectable()
export class CnResourcesService extends BlAbstractService<CnResourceEntity> {
  constructor(@InjectRepository(CnResourceEntity) private repository: Repository<CnResourceEntity>) {
    super(repository, CnResourceEntity);
  }

  public async saveResource(
    parentFolder: CnHierarchyObject,
    shareResourceDTO: CnShareResourceRequestDTO
  ): Promise<CnResource> {
    const resourceDb = await this.findByParentFolderIdAndResourceId(
      parentFolder.id,
      shareResourceDTO.resource_id
    );

    const resourceEntity = new CnResourceEntity();
    resourceEntity.resourceId = shareResourceDTO.resource_id;
    resourceEntity.name = shareResourceDTO.name;
    resourceEntity.typingName = shareResourceDTO.typing_name;
    resourceEntity.style = shareResourceDTO.style;
    resourceEntity.shareLink = shareResourceDTO.share_link;
    resourceEntity.validUntil = shareResourceDTO.valid_until;
    resourceEntity.lastModifiedAt = ClDateHelper.getDate();
    resourceEntity.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();

    if (resourceDb) {
      // update
      resourceEntity.id = resourceDb.id;
      return this.updateWithCompare(resourceEntity, resourceDb as CnResourceEntity);
    } else {
      // create
      resourceEntity.createdAt = ClDateHelper.getDate();
      resourceEntity.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
      resourceEntity.hierarchyRepresentation = CnHierarchyObjectEntity.newSubHierarchyObject(
        parentFolder,
        resourceEntity.getHierarchyObjectInfo()
      );
      resourceEntity.lab = CnCurrentUserHelper.getAndCheckCurrentLab();

      return this.create(resourceEntity);
    }
  }

  private findByParentFolderIdAndResourceId(parentFolderId: string, resourceId: string): Promise<CnResource> {
    return this.repository.findOne({
      where: {
        resourceId: resourceId,
        hierarchyRepresentation: {
          parentId: parentFolderId,
        },
      },
    });
  }

  public findWithLabByIdAndCheck(id: string): Promise<CnResourceWithLab> {
    return this.findByIdAndCheck(id, { lab: true });
  }

  public renameResource(id: string, name: string): Promise<CnResource> {
    return this.updatePartial(id, { name });
  }
}
