import { BlUserSearch } from '@monorepo/back-core-lib';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

import { CnUser } from './cn-user.entity';

/**
 * For the direct user search we do not modify the options
 */
export class CnUserSearch extends BlUserSearch<CnUser> {
  protected getRelation(): FindOptionsRelations<CnUser> {
    return undefined;
  }

  protected wrapFindOption(option: FindOptionsWhere<CnUser>): FindOptionsWhere<CnUser> {
    return option;
  }

  protected wrapOrderOption(option: FindOptionsOrder<CnUser>): FindOptionsOrder<CnUser> {
    return option;
  }
}
