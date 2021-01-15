import {FlArrayObs} from './fl-array-obs.class';
import {Observable} from 'rxjs';
import {ClHelpService} from '@monorepo/core-lib';
import {FlEntity} from '../fl-entity.class';

export class FlEntityArrayObs<T extends FlEntity> extends FlArrayObs<T> {

  constructor(data?: T[] | Observable<T[]>) {
    super(data);
  }

  protected equals(a: T, b: T): boolean {
    return ClHelpService.compareFnIds(a, b);
  }
}
