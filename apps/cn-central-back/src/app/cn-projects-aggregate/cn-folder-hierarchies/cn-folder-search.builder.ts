import { BlSearchBuilder, BlSearchParams } from '@monorepo/back-core-lib';
import { CnFolderHierarchy } from './cn-folder-hierarchy.entity';
import { IsNull } from 'typeorm';

/**
 * Override the search builder to add to some logic
 */
export class CnFolderSearchBuilder extends BlSearchBuilder<CnFolderHierarchy> {


  addSearchParams(searchParams: BlSearchParams): void {
    // clone because it will be modified
    searchParams = searchParams.clone();

    // if the includeSubProjects is True, we don't add the filter on project level
    if (!searchParams.getFilterValue('includeSubProjects')) {
      // otherwise we only get main project
      this.mergeWhereOptions({parentId: IsNull()});
    }
    searchParams.removeFilter('includeSubProjects');

    super.addSearchParams(searchParams);
  }
}
