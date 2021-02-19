import {LabBaseEntity} from '../../core/model/global/lab-entity.entity';
import {Type} from 'class-transformer';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

// export type BiotaDataVM = ViewModel<BiotaData>;

export class BiotaDataDetail {

  title: string;

  definition: string;
}

/**
 * One line of biota database
 */
export class BiotaData extends LabBaseEntity {

  @Type(() => BiotaDataDetail)
  data: BiotaDataDetail;
}

export type BiotaDataDatasource = FlEntityPaginatedDatasource<BiotaData>;
