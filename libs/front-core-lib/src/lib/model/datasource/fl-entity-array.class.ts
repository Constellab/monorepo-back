import {FlArrayObs} from './fl-array-obs.class';
import {Observable} from 'rxjs';
import {ClHelpService} from '@monorepo/core-lib';
import {FlEntity} from '../fl-entity.class';

export class FlEntityArrayObs<T extends FlEntity> extends FlArrayObs<T> {

  /**
   * @param data initial data
   * @param disableAutoDisconnect, if true the auto disconnect is disabled. mat-table and fl-async-section will
   * not automatically disconnect the array obs. It needs to be done manually (call manualDisconnect method)
   * @protected
   */
  constructor(data?: T[] | Observable<T[]>, disableAutoDisconnect: boolean = false) {
    super(data, disableAutoDisconnect);
  }

  protected equals(a: T, b: T): boolean {
    return ClHelpService.compareFnIds(a, b);
  }
}
