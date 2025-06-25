import { BlAbstractPaginatedService, BlUserSearch } from '@monorepo/back-core-lib';
import { FindOptionsWhere } from 'typeorm';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnSpaceUserEntity, CnSpaceUserWithUser } from './cn-space-user.entity';

export class CnSpaceUserSearch extends BlUserSearch<CnSpaceUserWithUser> {
  constructor(
    service: BlAbstractPaginatedService<CnSpaceUserEntity>,
    private spaceId: string
  ) {
    super(service);
  }

  protected getRelation(): FindOptionsRelations<CnSpaceUserEntity> {
    return { user: true };
  }

  protected wrapFindOption(option: FindOptionsWhere<CnUser>): FindOptionsWhere<CnSpaceUserEntity> {
    return { user: option, spaceId: this.spaceId };
  }

  protected wrapOrderOption(option: FindOptionsOrder<CnUser>): FindOptionsOrder<CnSpaceUserEntity> {
    return { user: option };
  }
}
