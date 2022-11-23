import {Injectable} from '@nestjs/common';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnCloudProvider} from './cn-cloud-provider.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnConfigEntitySecurity} from '../cn-core/security/cn-config-entity.security';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {ClPage} from '@monorepo/core-lib';


@Injectable()
export class CnCloudProvidersService extends BlAbstractService<CnCloudProvider> {


  constructor(@InjectRepository(CnCloudProvider) private repository: Repository<CnCloudProvider>,
              private securityService: CnConfigEntitySecurity) {
    super(repository, CnCloudProvider);
  }

  public async createSecure(cloudProvider: CnCloudProvider): Promise<CnCloudProvider> {
    await this.checkAuthorizationToModifyEntity();
    return this.create(cloudProvider);
  }

  public async updateSecure(cloudProvider: CnCloudProvider): Promise<CnCloudProvider> {
    await this.checkAuthorizationToModifyEntity();
    return this.update(cloudProvider);
  }

  public async deleteSecure(id: string): Promise<void> {
    await this.checkAuthorizationToModifyEntity();
    await this.deleteById(id);
  }

  public async findAllSecure(page: number, size: number): Promise<ClPage<CnCloudProvider>> {
    await this.checkAuthorizationToReadEntity();
    return this.findPaginated(page, size, {order: {name: 'ASC'}});
  }

  ////////////////////////////// AUTHORIZATION //////////////////////////////

  public async checkAuthorizationToModifyEntity(): Promise<void> {
    return this.securityService.checkAuthorizationToModifyEntity(CnCurrentUserHelper.getAndCheckCurrentUser());
  }

  public async checkAuthorizationToReadEntity(): Promise<void> {
    return this.securityService.checkAuthorizationToReadEntity();
  }
}
