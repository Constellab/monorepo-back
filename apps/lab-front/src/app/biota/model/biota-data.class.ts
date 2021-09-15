import {LabBaseEntity} from '../../core/model/global/lab-entity.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

// export type BiotaDataVM = ViewModel<BiotaData>;

/**
 * One line of biota database
 */
export class BiotaData extends LabBaseEntity {

  name: string;

  sbo_id: string;
}

export type BiotaDataDatasource = FlEntityPaginatedDatasource<BiotaData>;
