import {LabBaseEntity} from '../../lab-core/model/global/lab-entity.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

// export type BiotaDataVM = ViewModel<BiotaData>;

/**
 * One line of biota database
 */
export class LabBiotaData extends LabBaseEntity {

  name: string;

  sbo_id: string;

  data: any;
}

export type LabBiotaDataDatasource = FlEntityPaginatedDatasource<LabBiotaData>;
