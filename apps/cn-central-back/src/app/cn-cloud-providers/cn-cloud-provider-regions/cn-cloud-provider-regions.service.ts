import {Injectable} from '@nestjs/common';
import {BlAbstractService, BlBadRequestException} from '@monorepo/back-core-lib';
import {CnCloudProviderRegion} from './cn-cloud-provider-region.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {And, EntityManager, IsNull, Not, Repository} from 'typeorm';
import {ClPage} from '@monorepo/core-lib';
import {CnCloudProviderName} from '../cn-cloud-provider.entity';
import {FindOptionsWhere} from 'typeorm/find-options/FindOptionsWhere';


@Injectable()
export class CnCloudProviderRegionService extends BlAbstractService<CnCloudProviderRegion> {

  constructor(@InjectRepository(CnCloudProviderRegion) private repository: Repository<CnCloudProviderRegion>) {
    super(repository, CnCloudProviderRegion);
  }

  public async create(entity: CnCloudProviderRegion, entityManager?: EntityManager): Promise<CnCloudProviderRegion> {
    entity = await this.checkRegionBeforeSave(entity);
    return super.create(entity, entityManager);
  }

  public async update(entity: CnCloudProviderRegion, entityManager?: EntityManager): Promise<CnCloudProviderRegion> {
    entity = await this.checkRegionBeforeSave(entity);
    return super.update(entity, entityManager);
  }

  /**
   * Check if a region with the same technical name already exists for the cloud provider
   * @param region
   * @private
   */
  private async checkRegionBeforeSave(region: CnCloudProviderRegion): Promise<CnCloudProviderRegion> {
    if (region.isCloud()) {

      const existingRegion = await this.findByCloudProviderAndTechnicalName(region.cloudProvider.id, region.technicalName);
      if (existingRegion && existingRegion.id !== region.id) {
        // eslint-disable-next-line max-len
        throw new BlBadRequestException(`There is already a region ${region.technicalName} for the cloud provider ${region.cloudProvider.name}`);
      }
    } else {
      if (region.space == null) {
        throw new BlBadRequestException(`The space is required for on premise region`);
      }
    }
    return region;
  }

  public findByCloudProviderAndTechnicalName(cloudProviderId: string, technicalName: string): Promise<CnCloudProviderRegion> {
    return this.repository.findOneBy({
      cloudProvider: {id: cloudProviderId},
      technicalName: technicalName
    });
  }

  public async findByCloudProviderNameAndTechnicalNameAndCheck(cloudProviderName: CnCloudProviderName,
                                                               technicalName: string): Promise<CnCloudProviderRegion> {
    const region = await this.repository.findOneBy({
      cloudProvider: {name: cloudProviderName},
      technicalName: technicalName
    });
    if (!region) {
      throw new BlBadRequestException(`The region ${technicalName} does not exist for the cloud provider ${cloudProviderName}`);
    }

    return region;
  }

  public findAll(page: number, size: number, spaceId?: string): Promise<ClPage<CnCloudProviderRegion>> {
    let where: FindOptionsWhere<CnCloudProviderRegion>[];

    if (spaceId) {
      where = [
        {space: {id: spaceId}},
        {space: IsNull()}
      ];
    } else {
      where = [];
    }

    return this.findPaginated(page, size, {where});
  }

  public findS3Regions(page: number, size: number, spaceId?: string): Promise<ClPage<CnCloudProviderRegion>> {
    let where: FindOptionsWhere<CnCloudProviderRegion>[];

    if (spaceId) {
      where = [
        {
          space: {id: spaceId},
          s3Endpoint: And(Not(IsNull()), Not(''))
        },
        {
          space: IsNull(),
          s3Endpoint: And(Not(IsNull()), Not(''))
        }
      ];
    } else {
      where = [{s3Endpoint: And(Not(IsNull()), Not(''))}];
    }

    return this.findPaginated(page, size, {
      where: where
    });
  }

}
