import {Injectable} from '@nestjs/common';
import {CnCloudProvidersService} from './cn-cloud-providers.service';
import {CnCloudProviderRegionService} from './cn-cloud-provider-regions/cn-cloud-provider-regions.service';
import {CnCloudProviderRegion} from './cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {ClPage} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnCloudProviderSecurity} from './cn-cloud-provider.security';
import {CnCloudProvider} from './cn-cloud-provider.entity';


@Injectable()
export class CnCloudProviderAggregateService {

  private static readonly LabBackupDefaultRegion = 'gra';


  constructor(private securityService: CnCloudProviderSecurity,
              private cloudProviderService: CnCloudProvidersService,
              private cloudProviderRegionService: CnCloudProviderRegionService) {

  }


  /////////////////////////// Cloud Provider ///////////////////////////
  public async createCloudProvider(cloudProvider: CnCloudProvider): Promise<CnCloudProvider> {
    await this.checkAuthorizationToModifyEntity();
    return this.cloudProviderService.create(cloudProvider);
  }

  public async updateCloudProvider(cloudProvider: CnCloudProvider): Promise<CnCloudProvider> {
    await this.checkAuthorizationToModifyEntity();
    return this.cloudProviderService.update(cloudProvider);
  }

  public async deleteCloudProvider(id: string): Promise<void> {
    await this.checkAuthorizationToModifyEntity();
    await this.cloudProviderService.deleteById(id);
  }

  public async findAllCloudProviders(page: number, size: number): Promise<ClPage<CnCloudProvider>> {
    await this.checkAuthorizationToGetEntity();
    return this.cloudProviderService.findAll(page, size);
  }

  /////////////////////////// REGION ///////////////////////////

  public async createRegion(region: CnCloudProviderRegion): Promise<CnCloudProviderRegion> {
    this.checkAuthorizationToModifyEntity();
    return this.cloudProviderRegionService.create(region);
  }

  public async updateRegion(region: CnCloudProviderRegion): Promise<CnCloudProviderRegion> {
    this.checkAuthorizationToModifyEntity();
    return this.cloudProviderRegionService.update(region);
  }

  public async deleteRegion(id: string): Promise<void> {
    this.checkAuthorizationToModifyEntity();
    await this.cloudProviderRegionService.deleteById(id);
  }

  public async getRegion(id: string): Promise<CnCloudProviderRegion> {
    this.checkAuthorizationToGetEntity();
    return this.cloudProviderRegionService.findByIdAndCheck(id);
  }

  public async getRegions(page: number, size: number): Promise<ClPage<CnCloudProviderRegion>> {
    this.checkAuthorizationToGetEntity();
    return this.cloudProviderRegionService.findAll(page, size);
  }

  public async getDefaultRegion(): Promise<CnCloudProviderRegion> {
    return await this.cloudProviderRegionService.findByCloudProviderNameAndTechnicalNameAndCheck(
      'OVH', CnCloudProviderAggregateService.LabBackupDefaultRegion);
  }
  //////////////////////////// AUTHORIZATION ////////////////////////////

  public checkAuthorizationToModifyEntity(): void {
    this.securityService.checkAuthorizationToModifyEntity(CnCurrentUserHelper.getAndCheckCurrentUser());
  }

  public checkAuthorizationToGetEntity(): void {
    this.securityService.checkAuthorizationToGetEntity();
  }


}
