import {CaBaseEntity} from './ca-base-entity.class';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {CaCity} from './ca-city.entity';


export class CaCloudProvider extends CaBaseEntity {

  // name of the cloud provider
  name: string;

}


export type CaCloudProviderDatasource = FlEntityPaginatedDatasource<CaCloudProvider>;

export class CaCloudProviderRegion extends CaBaseEntity {

  technicalName: string;

  s3Endpoint: string;

  @Type(() => CaCloudProvider)
  cloudProvider: CaCloudProvider;

  @Type(() => CaCity)
  city: CaCity;
}

export type CaCloudProviderRegionDatasource = FlEntityPaginatedDatasource<CaCloudProviderRegion>;
