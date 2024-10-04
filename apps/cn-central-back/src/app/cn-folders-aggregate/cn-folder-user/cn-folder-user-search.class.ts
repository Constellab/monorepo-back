import { BlAbstractPaginatedService, BlUser, BlUserSearch } from '@monorepo/back-core-lib';
import { CnFolderUserEntity } from './cn-folder-user.entity';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';


export class CnFolderUserSearch extends BlUserSearch<CnFolderUserEntity> {

  constructor(service: BlAbstractPaginatedService<CnFolderUserEntity>,
              private rootFolderId: string) {
    super(service);
  }

  protected getRelation(): FindOptionsRelations<CnFolderUserEntity> {
    return {user: true};
  }

  protected wrapFindOption(option: FindOptionsWhere<BlUser>): FindOptionsWhere<CnFolderUserEntity> {
    return {user: option, rootFolderId: this.rootFolderId};
  }

  protected wrapOrderOption(option: FindOptionsOrder<BlUser>): FindOptionsOrder<CnFolderUserEntity> {
    return {user: option};
  }


}
