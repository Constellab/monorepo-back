import {Expose, Type} from 'class-transformer';
import {ViewModel} from '../../global/view-model.entity';
import {ViewModelDatasourcePaginated} from '../../../utils/view-model.datasource';
import {BioxProcessable, BioxProcessableData} from './biox-processable.entity';

export class BioxProcessData implements BioxProcessableData {
  title: string;

  description?: string;

  doc?: string;

  graph: void;
}


export class BioxProcess extends BioxProcessable {

  @Type(() => BioxProcessData)
  data: BioxProcessData;

  @Expose({name: 'is_protocol'})
  isProtocol: false
}


export type BioxProcessVM = ViewModel<BioxProcess>;

export type BioxProcessDatasource = ViewModelDatasourcePaginated<BioxProcess>;
