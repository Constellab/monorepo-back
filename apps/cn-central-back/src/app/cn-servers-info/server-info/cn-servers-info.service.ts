import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {CnServerInfo} from './cn-server-info.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {BlAbstractService, BlSearchBuilder, BlSearchParams} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {CnCloudProviderName} from '../../cn-cloud-providers/cn-cloud-provider.entity';

@Injectable()
export class CnServersInfoService extends BlAbstractService<CnServerInfo> {

  constructor(@InjectRepository(CnServerInfo) private repository: Repository<CnServerInfo>) {
    super(repository, CnServerInfo);
  }

  public async findAll(page: number, size: number): Promise<ClPage<CnServerInfo>> {
    return this.findPaginated(page, size, {
      order: {technicalName: 'ASC'}
    });
  }

  public async findByCloudProviderAndName(cloudProviderName: CnCloudProviderName, name: string): Promise<CnServerInfo | null> {
    return this.repository.findOne({
      where: {
        technicalName: name,
        cloudProvider: {
          name: cloudProviderName
        }
      }
    });
  }

  public async findByName(name: string): Promise<CnServerInfo[]> {
    return this.repository.find({
      where: {
        name: name
      }
    });
  }

  public async search(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnServerInfo>> {
    const searchBuilder = new BlSearchBuilder<CnServerInfo>({technicalName: 'ASC'});
    searchBuilder.addSearchParams(searchParams);

    return this.findPaginated(page, size, searchBuilder.build());
  }
}
