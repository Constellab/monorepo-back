import { BlAbstractService } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CnCloudProvider } from './cn-cloud-provider.entity';

@Injectable()
export class CnCloudProvidersService extends BlAbstractService<CnCloudProvider> {
  constructor(@InjectRepository(CnCloudProvider) private repository: Repository<CnCloudProvider>) {
    super(repository, CnCloudProvider);
  }

  public async findAll(page: number, size: number): Promise<ClPage<CnCloudProvider>> {
    return this.findPaginated(page, size, { order: { name: 'ASC' } });
  }
}
