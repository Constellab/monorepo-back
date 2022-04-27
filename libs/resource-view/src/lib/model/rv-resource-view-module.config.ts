import {RvResourceViewTypeInfo} from './rv-type-info.class';
import {InjectionToken} from '@angular/core';


export interface RvResourceViewModuleConfig {
  // list the views that are available
  availableViews: Record<string, RvResourceViewTypeInfo>;
}

/**
 * @ignore
 * Use to inject the configuration of the ResourceViewModule
 *
 * Use '@Inject(RV_MODULE_CONFIG)' to inject it in component or service
 */
export const RV_MODULE_CONFIG =
  new InjectionToken<RvResourceViewModuleConfig>('RV_MODULE_CONFIG');
