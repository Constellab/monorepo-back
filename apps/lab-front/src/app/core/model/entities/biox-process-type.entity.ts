import {LabBaseEntity} from '../global/lab-entity.entity';
import {ViewModel} from '../global/view-model.entity';
import {ViewModelDatasourcePaginated} from '../../utils/view-model.datasource';

export class BioxProcessType extends LabBaseEntity {

  type: 'gws.model.ProcessType';

  // type of the protocol
  ptype: string;
}

export type BioxProcessTypeVM = ViewModel<BioxProcessType>;

export type BioxProcessTypeDatasource = ViewModelDatasourcePaginated<BioxProcessType>;
