import {ArrayObs} from './array-obs.class';
import {Entity} from '../entities/entity.entity';
import {Observable} from 'rxjs';
import {HelpService} from '../../utils/help-service';

export class EntityArrayObs<T extends Entity> extends ArrayObs<T> {

  constructor(data?: T[] | Observable<T[]>) {
    super(data);
  }

  protected equals(a: T, b: T): boolean {
    return HelpService.compareFnIds(a, b);
  }
}
