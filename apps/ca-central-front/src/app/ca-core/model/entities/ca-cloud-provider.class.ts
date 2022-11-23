import {CaBaseEntity} from './ca-base-entity.class';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';


export class CaCloudProvider extends CaBaseEntity {

  // name of the cloud provider
  name: string;

}


export type CaCloudProviderDatasource = FlEntityPaginatedDatasource<CaCloudProvider>;
