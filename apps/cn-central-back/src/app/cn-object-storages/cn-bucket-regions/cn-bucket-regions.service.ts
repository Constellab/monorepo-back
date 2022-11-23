import {BadRequestException, Injectable} from '@nestjs/common';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnBucketRegion} from './cn-bucker-region.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {ClPage} from '@monorepo/core-lib';


@Injectable()
export class CnBucketRegionService extends BlAbstractService<CnBucketRegion> {

  constructor(@InjectRepository(CnBucketRegion) private repository: Repository<CnBucketRegion>) {
    super(repository, CnBucketRegion);
  }

  public async create(entity: CnBucketRegion, entityManager?: EntityManager): Promise<CnBucketRegion> {
    entity = await this.checkRegionBeforeSave(entity);
    return super.create(entity, entityManager);
  }

  public async update(entity: CnBucketRegion, entityManager?: EntityManager): Promise<CnBucketRegion> {
    entity = await this.checkRegionBeforeSave(entity);
    return super.update(entity, entityManager);
  }

  /**
   * Check if a region with the same technical name already exists for the cloud provider
   * @param region
   * @private
   */
  private async checkRegionBeforeSave(region: CnBucketRegion): Promise<CnBucketRegion> {
    const existingRegion = await this.findByCloudProviderAndTechnicalName(region.cloudProvider.id, region.technicalName);

    if (existingRegion) {
      // eslint-disable-next-line max-len
      throw new BadRequestException(`There is already a region ${region.technicalName} for the cloud provider ${region.cloudProvider.name}`);
    }
    return region;
  }

  public findByCloudProviderAndTechnicalName(cloudProviderId: string, technicalName: string): Promise<CnBucketRegion> {
    return this.repository.findOneBy({
      cloudProvider: {id: cloudProviderId},
      technicalName: technicalName
    });
  }

  public async findByCloudProviderNameAndTechnicalNameAndCheck(cloudProviderName: string,
                                                               technicalName: string): Promise<CnBucketRegion> {
    const region = await this.repository.findOneBy({
      cloudProvider: {name: cloudProviderName},
      technicalName: technicalName
    });
    if (!region) {
      throw new BadRequestException(`The region ${technicalName} does not exist for the cloud provider ${cloudProviderName}`);
    }

    return region;
  }

  public findAll(page: number, size: number): Promise<ClPage<CnBucketRegion>> {
    return this.findPaginated(page, size);
  }

}
