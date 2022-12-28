import {Injectable} from '@nestjs/common';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnCloudProvider} from './cn-cloud-provider.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ClPage} from '@monorepo/core-lib';


@Injectable()
export class CnCloudProvidersService extends BlAbstractService<CnCloudProvider> {


  constructor(@InjectRepository(CnCloudProvider) private repository: Repository<CnCloudProvider>) {
    super(repository, CnCloudProvider);
  }

  public async findAll(page: number, size: number): Promise<ClPage<CnCloudProvider>> {
    return this.findPaginated(page, size, {order: {name: 'ASC'}});
  }


}
