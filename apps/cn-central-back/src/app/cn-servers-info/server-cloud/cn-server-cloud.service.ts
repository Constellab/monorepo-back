import { Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { CnServerCloud } from './cn-server-cloud.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BlAbstractService, BlSearchBuilder, BlSearchParams } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { CnCloudProviderName } from '../../cn-cloud-providers/cn-cloud-provider.entity';

@Injectable()
export class CnServerCloudService extends BlAbstractService<CnServerCloud> {
  constructor(@InjectRepository(CnServerCloud) private repository: Repository<CnServerCloud>) {
    super(repository, CnServerCloud);
  }

  public async findAll(page: number, size: number): Promise<ClPage<CnServerCloud>> {
    return this.findPaginated(page, size, {
      order: { technicalName: 'ASC' },
    });
  }

  public async findByCloudProviderAndName(
    cloudProviderName: CnCloudProviderName,
    name: string
  ): Promise<CnServerCloud | null> {
    return this.repository.findOne({
      where: {
        technicalName: name,
        cloudProvider: {
          name: cloudProviderName,
        },
      },
    });
  }

  public async findByServerStandardId(serverStandardId: string): Promise<CnServerCloud[]> {
    return this.repository.find({
      where: {
        serverStandard: {
          id: serverStandardId,
        },
      },
    });
  }

  public async search(
    searchParams: BlSearchParams,
    page: number,
    size: number
  ): Promise<ClPage<CnServerCloud>> {
    const searchBuilder = new BlSearchBuilder<CnServerCloud>({ technicalName: 'ASC' });
    searchBuilder.addSearchParams(searchParams);

    return this.findPaginated(page, size, searchBuilder.build());
  }

  public async searchByName(name: string, page: number, size: number): Promise<ClPage<CnServerCloud>> {
    return this.findPaginated(page, size, {
      where: {
        technicalName: Like(`%${name}%`),
      },
      order: { technicalName: 'ASC' },
    });
  }
}
