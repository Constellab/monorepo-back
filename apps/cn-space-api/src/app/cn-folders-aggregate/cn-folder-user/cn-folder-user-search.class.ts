import { BlAbstractPaginatedService, BlUser, BlUserSearch } from '@monorepo/back-core-lib';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

import { CnFolderUserEntity } from './cn-folder-user.entity';

export class CnFolderUserSearch extends BlUserSearch<CnFolderUserEntity> {
  constructor(
    service: BlAbstractPaginatedService<CnFolderUserEntity>,
    private rootFolderId: string
  ) {
    super(service);
  }

  protected getRelation(): FindOptionsRelations<CnFolderUserEntity> {
    return { user: true };
  }

  protected wrapFindOption(option: FindOptionsWhere<BlUser>): FindOptionsWhere<CnFolderUserEntity> {
    return { user: option, rootFolderId: this.rootFolderId };
  }

  protected wrapOrderOption(option: FindOptionsOrder<BlUser>): FindOptionsOrder<CnFolderUserEntity> {
    return { user: option };
  }
}
