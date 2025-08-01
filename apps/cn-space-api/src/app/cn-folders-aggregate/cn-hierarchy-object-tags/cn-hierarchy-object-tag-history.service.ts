import { BlAbstractService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnTag } from './cn-hierarchy-object-tag.dto';
import {
  CnHierarchyObjectTagHistory,
  CnHierarchyObjectTagHistoryEntity,
  CnHierarchyObjectTagHistoryType,
} from './cn-hierarchy-object-tag-history.entity';

@Injectable()
export class CnHierarchyObjectTagHistoryService extends BlAbstractService<CnHierarchyObjectTagHistoryEntity> {
  constructor(
    @InjectRepository(CnHierarchyObjectTagHistoryEntity)
    repository: Repository<CnHierarchyObjectTagHistoryEntity>
  ) {
    super(repository, CnHierarchyObjectTagHistoryEntity);
  }

  public createHistory(
    tag: CnTag,
    hierarchyObject: CnHierarchyObject,
    type: CnHierarchyObjectTagHistoryType,
    entityManager: EntityManager
  ): Promise<CnHierarchyObjectTagHistory> {
    const history = new CnHierarchyObjectTagHistoryEntity();
    history.key = tag.key;
    history.value = tag.value;
    history.hierarchyObject = hierarchyObject;
    history.type = type;
    return this.create(history, entityManager);
  }
}
