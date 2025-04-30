import { Injectable } from '@nestjs/common';
import { BlAbstractService, BlBadRequestException } from '@monorepo/back-core-lib';
import { CnCloudProviderRegion, CnCloudProviderRegionType } from './cn-cloud-provider-region.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ClPage } from '@monorepo/core-lib';
import { CnCloudProviderName } from '../cn-cloud-provider.entity';

@Injectable()
export class CnCloudProviderRegionService extends BlAbstractService<CnCloudProviderRegion> {
  constructor(
    @InjectRepository(CnCloudProviderRegion) private repository: Repository<CnCloudProviderRegion>
  ) {
    super(repository, CnCloudProviderRegion);
  }

  public async create(
    entity: CnCloudProviderRegion,
    entityManager?: EntityManager
  ): Promise<CnCloudProviderRegion> {
    entity = await this.checkRegionBeforeSave(entity);
    return super.create(entity, entityManager);
  }

  public async update(
    entity: CnCloudProviderRegion,
    entityManager?: EntityManager
  ): Promise<CnCloudProviderRegion> {
    entity = await this.checkRegionBeforeSave(entity);
    return super.update(entity, entityManager);
  }

  /**
   * Check if a region with the same technical name already exists for the cloud provider
   * @param region
   * @private
   */
  private async checkRegionBeforeSave(region: CnCloudProviderRegion): Promise<CnCloudProviderRegion> {
    if (!region.cloudProvider) {
      throw new BlBadRequestException('The cloud provider is required');
    }

    const existingRegion = await this.findByCloudProviderAndTechnicalNameAndType(
      region.cloudProvider.id,
      region.technicalName,
      region.type
    );
    if (existingRegion && existingRegion.id !== region.id) {
      // eslint-disable-next-line max-len
      throw new BlBadRequestException(
        `There is already a ${region.type} region ${region.technicalName} ` +
          `for the cloud provider ${region.cloudProvider.name}`
      );
    }

    if (region.type === CnCloudProviderRegionType.S3 || region.type === CnCloudProviderRegionType.ALL) {
      if (!region.s3Endpoint) {
        throw new BlBadRequestException(`The S3 endpoint is required for S3 region ${region.technicalName}`);
      }
    } else {
      region.s3Endpoint = null;
    }

    return region;
  }

  public findByCloudProviderAndTechnicalNameAndType(
    cloudProviderId: string,
    technicalName: string,
    type: CnCloudProviderRegionType
  ): Promise<CnCloudProviderRegion> {
    return this.repository.findOneBy({
      cloudProvider: { id: cloudProviderId },
      technicalName: technicalName,
      type: type,
    });
  }

  public async findByCloudProviderNameAndTechnicalNameAndTypeAndCheck(
    cloudProviderName: CnCloudProviderName,
    technicalName: string,
    types: CnCloudProviderRegionType[]
  ): Promise<CnCloudProviderRegion> {
    const region = await this.repository.findOneBy({
      cloudProvider: { name: cloudProviderName },
      technicalName: technicalName,
      type: In(types),
    });
    if (!region) {
      throw new BlBadRequestException(
        `The region ${technicalName} does not exist for the cloud provider ${cloudProviderName}`
      );
    }

    return region;
  }

  public findAll(page: number, size: number): Promise<ClPage<CnCloudProviderRegion>> {
    return this.findPaginated(page, size);
  }

  public findRegionsByType(
    type: CnCloudProviderRegionType,
    page: number,
    size: number
  ): Promise<ClPage<CnCloudProviderRegion>> {
    return this.findPaginated(page, size, {
      where: { type: In([type, CnCloudProviderRegionType.ALL]) },
    });
  }

  public findRegionsByCloudProvider(
    cloudProviderName: CnCloudProviderName,
    page: number,
    size: number
  ): Promise<ClPage<CnCloudProviderRegion>> {
    return this.findPaginated(page, size, {
      where: { cloudProvider: { name: cloudProviderName } },
    });
  }

  public findServerRegionByCloudProvider(cloudProviderId: string): Promise<CnCloudProviderRegion[]> {
    return this.repository.find({
      where: {
        cloudProvider: { id: cloudProviderId },
        type: In([CnCloudProviderRegionType.SERVER, CnCloudProviderRegionType.ALL]),
      },
    });
  }
}
