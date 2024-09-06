import { BlAbstractPaginatedService, BlUser, BlUserSearch } from '@monorepo/back-core-lib';
import { CnProjectUser } from './cn-project-user.entity';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';


export class CnProjectUserSearch extends BlUserSearch<CnProjectUser> {

  constructor(service: BlAbstractPaginatedService<CnProjectUser>,
              private rootFolderId: string) {
    super(service);
  }

  protected getRelation(): FindOptionsRelations<CnProjectUser> {
    return {user: true};
  }

  protected wrapFindOption(option: FindOptionsWhere<BlUser>): FindOptionsWhere<CnProjectUser> {
    return {user: option, rootFolderId: this.rootFolderId};
  }

  protected wrapOrderOption(option: FindOptionsOrder<BlUser>): FindOptionsOrder<CnProjectUser> {
    return {user: option};
  }


}
