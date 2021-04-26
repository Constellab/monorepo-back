import {LabBaseEntity} from '../global/lab-entity.entity';
import {ViewModel} from '../global/view-model.entity';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

export class BioxProcessType extends LabBaseEntity {

  type: 'gws.model.ProcessType';

  // type of the protocol
  ptype: string;
}

export type BioxProcessTypeVM = ViewModel<BioxProcessType>;

export type BioxProcessTypeDatasource = FlEntityPaginatedDatasource<BioxProcessType>;
