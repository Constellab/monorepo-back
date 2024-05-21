import {Injectable} from '@nestjs/common';
import {BlSearchParams} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {CnServerCloudService} from './server-cloud/cn-server-cloud.service';
import {CnServerPriceService} from './server-price/cn-server-price.service';
import {CnServerCloud} from './server-cloud/cn-server-cloud.entity';
import {CnConfigEntitySecurity} from '../cn-core/security/cn-config-entity.security';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnCloudProviderAggregateService} from '../cn-cloud-providers/cn-cloud-provider-aggregate.service';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnServerStandard} from './server-standard/cn-server-standard.entity';
import {CnServerStandardService} from './server-standard/cn-server-standard.service';
import {CnServerStandardSaveDTO} from './server-standard/cn-server-standard.dto';
import {DataSource} from 'typeorm';
import {CnServerPrice} from './server-price/cn-server-price.entity';
import {CnCreateServerPriceDTO} from './server-price/cn-server-price.dto';
import {CnCreateStoragePriceDTO} from './storage-price/cn-storage-price.dto';
import {CnStoragePrice} from './storage-price/cn-storage-price.entity';
import {CnStoragePriceService} from './storage-price/cn-storage-price.service';

@Injectable()
export class CnServerAggregateService {

  constructor(private serversCloudService: CnServerCloudService,
              private serverStandardService: CnServerStandardService,
              private serverPriceService: CnServerPriceService,
              private storagePriceService: CnStoragePriceService,
              private securityService: CnConfigEntitySecurity,
              private cloudProviderService: CnCloudProviderAggregateService,
              private datasource: DataSource) {
  }

  //////////////////////////////////// SERVER STANDARD ////////////////////////////////////

  public async createServerStandard(saveDTO: CnServerStandardSaveDTO): Promise<CnServerStandard> {
    await this.checkAuthorizationToModifyEntity();
    const serverStandard = this.serverStandardFromSaveDTO(saveDTO);

    return this.datasource.transaction(async (manager) => {
      const serverStandardDB = await this.serverStandardService.create(serverStandard, manager);

      // create default price
      await this.serverPriceService.createFirstPrice(serverStandardDB, saveDTO.price, manager);

      return serverStandardDB;
    });
  }

  public async updateServerStandard(saveDTO: CnServerStandardSaveDTO): Promise<CnServerStandard> {
    await this.checkAuthorizationToModifyEntity();
    return this.serverStandardService.update(this.serverStandardFromSaveDTO(saveDTO));
  }

  private serverStandardFromSaveDTO(saveDTO: CnServerStandardSaveDTO): CnServerStandard {
    const serverStandard = new CnServerStandard();
    serverStandard.id = saveDTO.id;
    serverStandard.name = saveDTO.name;
    serverStandard.description = saveDTO.description;
    serverStandard.technicalDescription = saveDTO.technicalDescription;
    return serverStandard;
  }

  public async deleteServerStandard(id: string): Promise<void> {
    await this.checkAuthorizationToModifyEntity();

    // check if a server uses this standard
    const serversCloud = await this.serversCloudService.findByServerStandardId(id);
    if (serversCloud.length > 0) {
      throw new Error('Cannot delete this server standard because it is used by cloud servers.');
    }

    await this.datasource.transaction(async (manager) => {
      await this.serverPriceService.deleteByServerStandard(id, manager);
      await this.serverStandardService.deleteById(id, manager);
    });
  }

  public async findAllServerStandard(page: number, size: number): Promise<ClPage<CnServerStandard>> {
    await this.checkAuthorizationToReadEntities();
    return this.serverStandardService.findAll(page, size);
  }

  public async findServerStandardByNames(names: string[]): Promise<CnServerStandard[]> {
    await this.checkAuthorizationToReadEntities();
    return this.serverStandardService.findByNames(names);
  }

  //////////////////////////////////// SERVER CLOUD ////////////////////////////////////

  public async createServerCloud(serverCloud: CnServerCloud): Promise<CnServerCloud> {
    await this.checkAuthorizationToModifyEntity();
    return this.serversCloudService.create(serverCloud);
  }

  public async updateServerCloud(serverCloud: CnServerCloud): Promise<CnServerCloud> {
    await this.checkAuthorizationToModifyEntity();
    return this.serversCloudService.update(serverCloud);
  }

  public async deleteServerCloud(id: string): Promise<void> {
    await this.checkAuthorizationToModifyEntity();
    await this.serversCloudService.deleteById(id);
  }

  public async findServerCloudById(id: string): Promise<CnServerCloud> {
    await this.checkAuthorizationToReadEntities();
    return this.serversCloudService.findByIdAndCheck(id);
  }

  public async findAllServerCloud(page: number, size: number): Promise<ClPage<CnServerCloud>> {
    await this.checkAuthorizationToReadEntities();
    return this.serversCloudService.findAll(page, size);
  }

  public async searchServerCloud(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnServerCloud>> {
    await this.checkAuthorizationToReadEntities();
    return this.serversCloudService.search(searchParams, page, size);
  }

  public async searchServerCloudByName(name: string, page: number, size: number): Promise<ClPage<CnServerCloud>> {
    await this.checkAuthorizationToReadEntities();
    return this.serversCloudService.searchByName(name, page, size);
  }


  public async findAvailableRegionsForServerCloud(serverCloudId: string): Promise<CnCloudProviderRegion[]> {
    const serverCloud = await this.serversCloudService.findByIdAndCheck(serverCloudId);
    // for now, we just return the regions of the cloud provider, it should be filtered by the server info
    return this.cloudProviderService.findServerRegionByCloudProvider(serverCloud.cloudProvider.id);
  }

  public async findServerCloudByServerStandardId(serverStandardId: string): Promise<CnServerCloud[]> {
    return this.serversCloudService.findByServerStandardId(serverStandardId);
  }

  ////////////////////////////// SERVER PRICE //////////////////////////////

  public async getServerCurrentPrice(serverStandardId: string): Promise<number> {
    const price = await this.serverPriceService.getAndCheckServerCurrentPrice(serverStandardId);
    return price.price;
  }

  public async getServerAllPrices(serverStandardId: string): Promise<CnServerPrice[]> {
    await this.checkAuthorizationToModifyEntity();
    const prices = await this.serverPriceService.getServerAllPrices(serverStandardId, 'DESC');
    return prices.prices;
  }

  public async createServerPrice(serverStandardId: string, price: CnCreateServerPriceDTO): Promise<CnServerPrice> {
    await this.checkAuthorizationToModifyEntity();

    const serverStandard = await this.serverStandardService.findByIdAndCheck(serverStandardId);
    return this.serverPriceService.createPrice(serverStandard, price);
  }

  public async deleteServerPrice(serverStandardId: string, priceId: string): Promise<void> {
    await this.checkAuthorizationToModifyEntity();
    const serverStandard = await this.serverStandardService.findByIdAndCheck(serverStandardId);
    await this.serverPriceService.deletePrice(serverStandard.id, priceId);
  }


  /////////////////////////////// STORAGE PRICE ///////////////////////////////
  public async getAllStoragePrices(): Promise<CnStoragePrice[]> {
    await this.checkAuthorizationToModifyEntity();
    return this.storagePriceService.findAll('DESC');
  }

  public async getStorageCurrentPrice(): Promise<number> {
    await this.checkAuthorizationToReadEntities();
    const price = await this.storagePriceService.getAndCheckCurrentStoragePrice();
    return price.totalPrice;
  }

  public async getStorageCurrentPriceDetail(): Promise<CnStoragePrice> {
    await this.checkAuthorizationToModifyEntity();
    return await this.storagePriceService.getAndCheckCurrentStoragePrice();
  }


  public async createStoragePrice(newPrice: CnCreateStoragePriceDTO): Promise<CnStoragePrice> {
    await this.checkAuthorizationToModifyEntity();
    return this.storagePriceService.createPrice(newPrice);
  }

  public async deleteStoragePrice(priceId: string): Promise<void> {
    await this.checkAuthorizationToModifyEntity();
    await this.storagePriceService.deletePrice(priceId);
  }

  ////////////////////////////// AUTHORIZATION //////////////////////////////

  public async checkAuthorizationToModifyEntity(): Promise<void> {
    return this.securityService.checkAuthorizationToModifyEntity(CnCurrentUserHelper.getAndCheckCurrentUser());
  }

  public async checkAuthorizationToReadEntities(): Promise<void> {
    return this.securityService.checkAuthorizationToReadEntity();
  }


}
