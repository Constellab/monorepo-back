import { Injectable } from '@nestjs/common';
import { BlAbstractService, BlBadRequestException } from '@monorepo/back-core-lib';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CnHierarchyObjectTag, CnHierarchyObjectTagEntity } from './cn-hierarchy-object-tag.entity';
import { CnHierarchyObject } from '../cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnTag } from './cn-hierarchy-object-tag.dto';
import { ClPage } from '@monorepo/core-lib';

@Injectable()
export class CnHierarchyObjectTagService extends BlAbstractService<CnHierarchyObjectTagEntity> {
  constructor(
    @InjectRepository(CnHierarchyObjectTagEntity)
    private repository: Repository<CnHierarchyObjectTagEntity>
  ) {
    super(repository, CnHierarchyObjectTagEntity);
  }

  public createTag(
    tag: CnTag,
    hierarchyObject: CnHierarchyObject,
    entityManager: EntityManager
  ): Promise<CnHierarchyObjectTag> {
    const entityTag = new CnHierarchyObjectTagEntity();
    this.checkTag(tag.key);
    this.checkTag(tag.value);
    entityTag.key = tag.key;
    entityTag.value = tag.value;
    entityTag.hierarchyObject = hierarchyObject;
    return this.create(entityTag, entityManager);
  }

  private checkTag(tag: string): void {
    // allow only letters (lower case), numbers, '-', '_', '.' and '/'
    if (!/^[a-z0-9-_./]+$/.test(tag)) {
      throw new BlBadRequestException(
        'The tag only support alphanumeric characters in lower case, with "-", "_", "." and "/" allowed'
      );
    }
  }

  public findByTag(key: string, value: string, hierarchyObjectId: string): Promise<CnHierarchyObjectTag> {
    return this.repository.findOne({
      where: {
        key,
        value,
        hierarchyObject: { id: hierarchyObjectId },
      },
    });
  }

  public findByKeyAndHierarchyObject(
    key: string,
    hierarchyObjectId: string
  ): Promise<CnHierarchyObjectTag[]> {
    return this.repository.find({
      where: {
        key,
        hierarchyObject: { id: hierarchyObjectId },
      },
    });
  }

  public findByHierarchyObject(hierarchyObjectId: string): Promise<CnHierarchyObjectTag[]> {
    return this.repository.find({
      where: {
        hierarchyObject: { id: hierarchyObjectId },
      },
      order: {
        lastModifiedAt: 'DESC',
      },
    });
  }

  public findByHierarchyObjectPaginated(
    hierarchyObjectId: string,
    page: number,
    pageSize: number
  ): Promise<ClPage<CnHierarchyObjectTag>> {
    return this.findPaginated(page, pageSize, {
      where: {
        hierarchyObject: { id: hierarchyObjectId },
      },
      order: {
        lastModifiedAt: 'DESC',
      },
    });
  }
}
