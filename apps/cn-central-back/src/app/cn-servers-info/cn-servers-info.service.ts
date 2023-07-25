import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {CnServerInfo} from './cn-server-info.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {BlAbstractService, BlSearchBuilder, BlSearchParams} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {CnConfigEntitySecurity} from '../cn-core/security/cn-config-entity.security';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnCloudProviderName} from '../cn-cloud-providers/cn-cloud-provider.entity';

@Injectable()
export class CnServersInfoService extends BlAbstractService<CnServerInfo> {

  constructor(@InjectRepository(CnServerInfo) private repository: Repository<CnServerInfo>,
              private securityService: CnConfigEntitySecurity) {
    super(repository, CnServerInfo);
  }

  public async createSecure(serverInfo: CnServerInfo): Promise<CnServerInfo> {
    await this.checkAuthorizationToModifyEntity();
    return this.create(serverInfo);
  }

  public async updateSecure(serverInfo: CnServerInfo): Promise<CnServerInfo> {
    await this.checkAuthorizationToModifyEntity();
    return this.update(serverInfo);
  }

  public async deleteSecure(id: string): Promise<void> {
    await this.checkAuthorizationToModifyEntity();
    await this.deleteById(id);
  }

  public async findAllSecure(page: number, size: number): Promise<ClPage<CnServerInfo>> {
    await this.checkAuthorizationToReadEntities();
    return this.findPaginated(page, size, {
      order: {name: 'ASC'}
    });
  }

  public async findByCloudProviderAndName(cloudProviderName: CnCloudProviderName, name: string): Promise<CnServerInfo | null> {
    return this.repository.findOne({
      where: {
        name: name,
        cloudProvider: {
          name: cloudProviderName
        }
      }
    });
  }

  public async search(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnServerInfo>> {
    await this.checkAuthorizationToReadEntities();
    const searchBuilder = new BlSearchBuilder<CnServerInfo>({name: 'ASC'});
    searchBuilder.addSearchParams(searchParams);

    return this.findPaginated(page, size, searchBuilder.build());
  }

  ////////////////////////////// AUTHORIZATION //////////////////////////////

  public async checkAuthorizationToModifyEntity(): Promise<void> {
    return this.securityService.checkAuthorizationToModifyEntity(CnCurrentUserHelper.getAndCheckCurrentUser());
  }

  public async checkAuthorizationToReadEntities(): Promise<void> {
    return this.securityService.checkAuthorizationToReadEntity();
  }


}
