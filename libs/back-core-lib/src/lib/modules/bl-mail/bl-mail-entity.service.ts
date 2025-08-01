import { ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BlSearchBuilder } from '../../models/bl-search/bl-search.builder';
import { BlSearchParams } from '../../models/bl-search/bl-search.class';
import { BlAbstractService } from '../../services/bl-abstract.service';
import { BlMailEntity } from './bl-mail.entity';

@Injectable()
export class BlMailEntityService extends BlAbstractService<BlMailEntity> {
  constructor(@InjectRepository(BlMailEntity) public repository: Repository<BlMailEntity>) {
    super(repository, BlMailEntity);
  }

  public async search(
    searchParam: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<BlMailEntity>> {
    const searchBuilder = new BlSearchBuilder<BlMailEntity>({ lastModifiedAt: 'DESC' });

    searchBuilder.addSearchParams(searchParam);

    return await this.findPaginated(page, size, searchBuilder.build());
  }
}
