import {CaBaseEntity} from './ca-base-entity.class';
import {
  FlEntityPaginatedDatasource,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {CaGroup} from './ca-group.entity';
import {Type} from 'class-transformer';

export type CaSmartDbType = 'PUBLIC' | 'PRIVATE'

const caSmartDbTypeDict: FlStatusDict<CaSmartDbType> = {
  PUBLIC: FlStatusHelper.getInfoStatus('PUBLIC', 'smart_db.type_public', 'public'),
  PRIVATE: FlStatusHelper.getInfoStatus('PRIVATE', 'smart_db.type_private', 'lock'),
};


export class CaSmartDb extends CaBaseEntity {

  name: string;

  @FlStatusTransform(caSmartDbTypeDict)
  type: FlStatus<CaSmartDbType>;

  @Type(() => CaGroup)
  group: CaGroup;

}


export type CaSmartDbDatasource = FlEntityPaginatedDatasource<CaSmartDb>;

export interface CaSmartDbForm {
  id: string;
  name: string;
  type: CaSmartDbType;
  group: CaGroup;
}
