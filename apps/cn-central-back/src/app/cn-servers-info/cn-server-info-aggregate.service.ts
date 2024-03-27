import {Injectable} from '@nestjs/common';
import {BlSearchParams} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {CnServersInfoService} from './server-info/cn-servers-info.service';
import {CnServerInfoPriceService} from './price/cn-server-info-price.service';
import {CnServerInfo} from './server-info/cn-server-info.entity';
import {CnConfigEntitySecurity} from '../cn-core/security/cn-config-entity.security';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnCloudProviderAggregateService} from '../cn-cloud-providers/cn-cloud-provider-aggregate.service';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';

@Injectable()
export class CnServerInfoAggregateService {

  constructor(private serverInfoService: CnServersInfoService,
              private priceService: CnServerInfoPriceService,
              private securityService: CnConfigEntitySecurity,
              private cloudProviderService: CnCloudProviderAggregateService) {
  }

  public async create(serverInfo: CnServerInfo): Promise<CnServerInfo> {
    await this.checkAuthorizationToModifyEntity();
    return this.serverInfoService.create(serverInfo);
  }

  public async update(serverInfo: CnServerInfo): Promise<CnServerInfo> {
    await this.checkAuthorizationToModifyEntity();
    return this.serverInfoService.update(serverInfo);
  }

  public async delete(id: string): Promise<void> {
    await this.checkAuthorizationToModifyEntity();
    await this.serverInfoService.deleteById(id);
  }

  public async findAll(page: number, size: number): Promise<ClPage<CnServerInfo>> {
    await this.checkAuthorizationToReadEntities();
    return this.serverInfoService.findAll(page, size);
  }


  public async search(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnServerInfo>> {
    await this.checkAuthorizationToReadEntities();
    return this.serverInfoService.search(searchParams, page, size);
  }

  public async findAvailableRegionsForServer(serverInfoId: string): Promise<CnCloudProviderRegion[]>{
    const serverInfo = await this.serverInfoService.findByIdAndCheck(serverInfoId);
    // for now, we just return the regions of the cloud provider, it should be filtered by the server info
    return this.cloudProviderService.findServerRegionByCloudProvider(serverInfo.cloudProvider.id);
  }

  // TODO TO improve
  public async findServerInfoByStandardName(standardName: string): Promise<CnServerInfo[]> {
    return this.serverInfoService.findByName(standardName);
  }

  ////////////////////////////// PRICE MANAGEMENT //////////////////////////////

  // TODO to be implemented, communicate with selsy, see if we allow monthly price
  public async getServerCurrentPrice(serverInfoId: string): Promise<number> {
    const price = await this.priceService.getAndCheckServerCurrentPrice(serverInfoId);
    return price.price;
  }

  // TODO Migration
  public async createDefaultPrices(): Promise<void> {
    const serverInfos = await this.serverInfoService.findAll(0, 1000);

    for (const serverInfo of serverInfos.objects) {
      await this.priceService.createDefaultPrice(serverInfo);
    }
  }

  ////////////////////////////// AUTHORIZATION //////////////////////////////

  public async checkAuthorizationToModifyEntity(): Promise<void> {
    return this.securityService.checkAuthorizationToModifyEntity(CnCurrentUserHelper.getAndCheckCurrentUser());
  }

  public async checkAuthorizationToReadEntities(): Promise<void> {
    return this.securityService.checkAuthorizationToReadEntity();
  }


}
