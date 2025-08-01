import { ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';

import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnCloudProvider, CnCloudProviderName } from './cn-cloud-provider.entity';
import { CnCloudProviderSecurity } from './cn-cloud-provider.security';
import {
  CnCloudProviderRegion,
  CnCloudProviderRegionType,
} from './cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnCloudProviderRegionService } from './cn-cloud-provider-regions/cn-cloud-provider-regions.service';
import { CnCloudProvidersService } from './cn-cloud-providers.service';

@Injectable()
export class CnCloudProviderAggregateService {
  private static readonly defaultS3Region1 = 'gra';
  private static readonly defaultS3Region2 = 'sbg';

  constructor(
    private securityService: CnCloudProviderSecurity,
    private cloudProviderService: CnCloudProvidersService,
    private cloudProviderRegionService: CnCloudProviderRegionService
  ) {}

  /////////////////////////// Cloud Provider ///////////////////////////
  public async createCloudProvider(cloudProvider: CnCloudProvider): Promise<CnCloudProvider> {
    this.checkAuthorizationToModifyEntity();
    return this.cloudProviderService.create(cloudProvider);
  }

  public async updateCloudProvider(cloudProvider: CnCloudProvider): Promise<CnCloudProvider> {
    this.checkAuthorizationToModifyEntity();
    return this.cloudProviderService.update(cloudProvider);
  }

  public async deleteCloudProvider(id: string): Promise<void> {
    this.checkAuthorizationToModifyEntity();
    await this.cloudProviderService.deleteById(id);
  }

  public async findAllCloudProviders(page: number, size: number): Promise<ClPage<CnCloudProvider>> {
    this.checkAuthorizationToGetEntity();
    return this.cloudProviderService.findAll(page, size);
  }

  /////////////////////////// REGION ///////////////////////////

  public async createRegion(region: CnCloudProviderRegion): Promise<CnCloudProviderRegion> {
    this.checkAuthorizationToModifyEntity();
    return this.cloudProviderRegionService.create(region);
  }

  public async updateRegion(region: CnCloudProviderRegion): Promise<CnCloudProviderRegion> {
    this.checkAuthorizationToModifyEntity();
    const regionDb = await this.cloudProviderRegionService.findByIdAndCheck(region.id);
    if (
      regionDb.technicalName === CnCloudProviderAggregateService.defaultS3Region1 &&
      region.technicalName !== CnCloudProviderAggregateService.defaultS3Region1
    ) {
      throw new Error('You cannot modify the name of the default region : ' + regionDb.technicalName);
    }
    return this.cloudProviderRegionService.update(region);
  }

  public async deleteRegion(id: string): Promise<void> {
    this.checkAuthorizationToModifyEntity();

    const bucket = await this.cloudProviderRegionService.findByIdAndCheck(id);
    if (bucket.technicalName === CnCloudProviderAggregateService.defaultS3Region1) {
      throw new Error(`You cannot delete the default region: ${bucket.technicalName}`);
    }
    await this.cloudProviderRegionService.deleteById(id);
  }

  // route to get all regions, whatever the space, only accessible for admin
  public async getAllRegions(page: number, size: number): Promise<ClPage<CnCloudProviderRegion>> {
    this.checkAuthorizationToModifyEntity();
    return this.cloudProviderRegionService.findAll(page, size);
  }

  public async findRegionByType(
    type: CnCloudProviderRegionType,
    page: number,
    size: number
  ): Promise<ClPage<CnCloudProviderRegion>> {
    return this.cloudProviderRegionService.findRegionsByType(type, page, size);
  }

  public async findRegionsByCloudProvider(
    cloudProviderName: CnCloudProviderName,
    page: number,
    size: number
  ): Promise<ClPage<CnCloudProviderRegion>> {
    this.checkAuthorizationToGetEntity();
    return this.cloudProviderRegionService.findRegionsByCloudProvider(cloudProviderName, page, size);
  }

  public async findServerRegionByCloudProvider(cloudProviderId: string): Promise<CnCloudProviderRegion[]> {
    this.checkAuthorizationToGetEntity();
    return this.cloudProviderRegionService.findServerRegionByCloudProvider(cloudProviderId);
  }

  public findServerRegionByCloudProviderNameAndTechnicalName(
    cloudProviderName: CnCloudProviderName,
    technicalName: string
  ): Promise<CnCloudProviderRegion> {
    return this.cloudProviderRegionService.findByCloudProviderNameAndTechnicalNameAndTypeAndCheck(
      cloudProviderName,
      technicalName,
      [CnCloudProviderRegionType.SERVER, CnCloudProviderRegionType.ALL]
    );
  }

  public async getDefaultS3Region1(): Promise<CnCloudProviderRegion> {
    return await this.cloudProviderRegionService.findByCloudProviderNameAndTechnicalNameAndTypeAndCheck(
      'OVH',
      CnCloudProviderAggregateService.defaultS3Region1,
      [CnCloudProviderRegionType.S3, CnCloudProviderRegionType.ALL]
    );
  }

  public async getDefaultS3Region2(): Promise<CnCloudProviderRegion> {
    return await this.cloudProviderRegionService.findByCloudProviderNameAndTechnicalNameAndTypeAndCheck(
      'OVH',
      CnCloudProviderAggregateService.defaultS3Region2,
      [CnCloudProviderRegionType.S3, CnCloudProviderRegionType.ALL]
    );
  }

  //////////////////////////// AUTHORIZATION ////////////////////////////

  public checkAuthorizationToModifyEntity(): void {
    this.securityService.checkAuthorizationToModifyEntity(CnCurrentUserHelper.getAndCheckCurrentUser());
  }

  public checkAuthorizationToGetEntity(): void {
    this.securityService.checkAuthorizationToGetEntity();
  }
}
