import {BlSearchBuilder, BlSearchParams} from '@monorepo/back-core-lib';
import {CnProject} from './cn-project.entity';
import {CnProjectLevel} from './cn-project-level.enum';

/**
 * Override the search builder to add to some logic
 */
export class CnProjectSearchBuilder extends BlSearchBuilder<CnProject> {


  addSearchParams(searchParams: BlSearchParams): void {
    // clone because it will be modified
    searchParams = searchParams.clone();

    // if the includeSubProjects is True, we don't add the filter on project level
    if (!searchParams.getFilterValue('includeSubProjects')) {
      // otherwise we only get main project
      this.mergeWhereOptions({currentLevel: CnProjectLevel.PROJECT});
    }
    searchParams.removeFilter('includeSubProjects');

    super.addSearchParams(searchParams);
  }
}
