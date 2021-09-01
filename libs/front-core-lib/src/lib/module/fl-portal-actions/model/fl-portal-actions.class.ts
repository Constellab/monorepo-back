import {Observable} from 'rxjs';
import {FlTranslateParam} from '../../fl-translate/model/fl-translate-param';

/**
 * Action to be shown in the screen
 * The observable will be call automatically and result will be emitted as {@link FlPortalActionResult}
 */
export class FlPortalAction {

  /**
   * Action as observable Observable to subscribe
   */
  action: Observable<any>;

  /**
   * Text to show beside the loader
   */
  text: string;

  /**
   * type of the action, use to filter the results
   */
  type: string;

  /**
   * If true the text is translated
   */
  translateText?: boolean;

  /**
   * Param for the translation
   */
  translateParam?: FlTranslateParam;

}

/**
 * Current status of the action
 */
export type FlPortalActionStatus = 'ready' | 'loading' | 'success' | 'error';

/**
 * Information used within the {@link FlPortalActionsComponent}
 */
export class FlPortalActionDetail extends FlPortalAction {

  // current status of the loader, used to avoid triggering the loader multiple times
  status: FlPortalActionStatus;

  // used in the ngFor to track loaders
  symbol: symbol;
}

/**
 * Result of the actions observables, can be error or success
 */
export type FlPortalActionResult<T = any> = FlPortalActionSuccess<T> | FlPortalActionError;

/**
 * Object emitted when a action ended in success
 */
export class FlPortalActionSuccess<T = any> {
  status: 'success';
  result: T;
  action: FlPortalAction;
}

/**
 * Object emitted when an action ended up in error
 */
export class FlPortalActionError {
  status: 'error';
  result: any;
  action: FlPortalAction;
}
