import { BlSearchBuilder, BlSearchParams } from '@monorepo/back-core-lib';
import { In } from 'typeorm';

import { CnHierarchyObjectEntity, CnHierarchyObjectVisibility } from './cn-hierarchy-object.entity';

export class CnHierarchyObjectSearchBuilder extends BlSearchBuilder<CnHierarchyObjectEntity> {
  constructor() {
    super({ objectTypeOrder: 'ASC' });
    // force always ordering by objectTypeOrder asc first
    this.mergeOrderOptions({ objectTypeOrder: 'ASC' });
  }

  public addRootFolderIdsOption(rootFoldersIds: string[]): void {
    this.addOrOption({ rootParentId: In(rootFoldersIds) });
    this.addOrOption({ id: In(rootFoldersIds) });
  }

  public addSearchInRootFolderAndChildrenOption(
    rootFoldersIds: string[],
    spaceId: string,
    visibility: CnHierarchyObjectVisibility,
    searchParam: BlSearchParams
  ): void {
    this.addSearchParams(searchParam);
    this.mergeWhereOptions({ spaceId, visibility });
    this.addRootFolderIdsOption(rootFoldersIds);
  }
}
