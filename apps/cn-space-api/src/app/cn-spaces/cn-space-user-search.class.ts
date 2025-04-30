import { CnUser } from '../cn-users/cn-user.entity';
import { CnSpaceUser } from './cn-space-user.entity';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { FindOptionsWhere } from 'typeorm';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { BlAbstractPaginatedService, BlUserSearch } from '@monorepo/back-core-lib';

export class CnSpaceUserSearch extends BlUserSearch<CnSpaceUser> {
  constructor(
    service: BlAbstractPaginatedService<CnSpaceUser>,
    private spaceId: string
  ) {
    super(service);
  }

  protected getRelation(): FindOptionsRelations<CnSpaceUser> {
    return { user: true };
  }

  protected wrapFindOption(option: FindOptionsWhere<CnUser>): FindOptionsWhere<CnSpaceUser> {
    return { user: option, spaceId: this.spaceId };
  }

  protected wrapOrderOption(option: FindOptionsOrder<CnUser>): FindOptionsOrder<CnSpaceUser> {
    return { user: option };
  }
}
