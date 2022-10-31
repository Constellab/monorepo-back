import {CaBaseEntity} from './ca-base-entity.class';
import {
  FlEntityPaginatedDatasource,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';

export type CaSmartDbType = 'PUBLIC' | 'PRIVATE'

const caSmartDbTypeDict: FlStatusDict<CaSmartDbType> = {
  PUBLIC: FlStatusHelper.getInfoStatus('PUBLIC', 'smart_db.type_public', 'public'),
  PRIVATE: FlStatusHelper.getInfoStatus('PRIVATE', 'smart_db.type_private', 'lock'),
};


export class CaSmartDb extends CaBaseEntity {

  name: string;

  @FlStatusTransform(caSmartDbTypeDict)
  type: FlStatus<CaSmartDbType>;
}


export type CaSmartDbDatasource = FlEntityPaginatedDatasource<CaSmartDb>;
