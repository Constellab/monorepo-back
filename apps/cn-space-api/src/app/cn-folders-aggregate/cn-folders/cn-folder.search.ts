import { BlSearchBuilder, BlSearchParams } from '@monorepo/back-core-lib';
import { IsNull } from 'typeorm';

import { CnFolderEntity } from './cn-folder.entity';

/**
 * Override the search builder to add to some logic
 */
export class CnFolderSearch extends BlSearchBuilder<CnFolderEntity> {
  addSearchParams(searchParams: BlSearchParams): void {
    // clone because it will be modified
    searchParams = searchParams.clone();

    // if the includeSubFolders is True, we don't add the filter on folder level
    if (!searchParams.getFilterValue('includeSubFolders')) {
      // otherwise we only get root folder
      this.mergeWhereOptions({ hierarchyRepresentation: { parentId: IsNull() } });
    }

    searchParams.removeFilter('includeSubFolders');

    super.addSearchParams(searchParams);
  }
}
