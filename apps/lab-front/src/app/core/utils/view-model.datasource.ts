import {FlDatasourcePaginated, FlGetPageFunction} from '@monorepo/front-core-lib';
import {ClHelpService} from '@monorepo/core-lib';
import {LabBaseEntity} from '../model/global/lab-entity.entity';
import {ViewModel} from '../model/global/view-model.entity';

export class ViewModelDatasource<T extends LabBaseEntity> extends FlDatasourcePaginated<ViewModel<T>> {

  constructor(getPageFunction: FlGetPageFunction<ViewModel<T>>, pageSize: number, initFirstPage: boolean = true) {
    super(getPageFunction, pageSize, initFirstPage);
  }

  protected equals(a: ViewModel<T>, b: ViewModel<T>): boolean {
    return ClHelpService.compareFnIds(a.model, b.model);
  }


}
