import { BlSearchBuilder, BlSearchParams } from '@monorepo/back-core-lib';
import { CnHierarchyObject } from './cn-hierarchy-object.entity';
import { IsNull } from 'typeorm';

/**
 * Override the search builder to add to some logic
 */
export class CnHierarchyObjectSearch extends BlSearchBuilder<CnHierarchyObject> {


  addSearchParams(searchParams: BlSearchParams): void {
    // clone because it will be modified
    searchParams = searchParams.clone();

    // if the includeSubFolders is True, we don't add the filter on folder level
    if (!searchParams.getFilterValue('includeSubFolders')) {
      // otherwise we only get root folder
      this.mergeWhereOptions({parentId: IsNull()});
    }
    searchParams.removeFilter('includeSubFolders');

    super.addSearchParams(searchParams);
  }
}
