import {Injectable} from '@angular/core';
import {constBaseRoute} from '../../../../../central-front/src/app/core/utils/base-route';
import {constBioxFullRoute} from '../utils/base-route';

/**
 * Class to get app route paths
 */
@Injectable({
  providedIn: 'root'
})
export class RouterService {

  constructor() {
  }

  ////// Static function to get routes  //////
  public static getAppRoute(): string {
    return `/${constBaseRoute}`;
  }

  // public
  public static getLabExperimentDetailRoute(labExperimentId: string): string {
    return `${constBioxFullRoute}/experiment/${labExperimentId}`;
  }
}
