import {InjectionToken} from '@angular/core';

/**
 * Config for the {@link FlSvgIconModule}
 */
export interface FlSvgIconConfig {
  /**
   * path (in assets) of the svg icons
   */
  iconFolder: string;

  /**
   * List of icons to register
   */
  iconsToRegister: FlSvgIcon[];
}

/**
 * Information to register icons
 */
export interface FlSvgIcon {
  name: string;
  filename: string;
}

/**
 * @ignore
 * Use to inject the configuration of the svg icon module
 *
 * Use '@Inject(LF_SVG_ICON_MODULE)' to inject it in component or service
 */
export const LF_SVG_ICON_MODULE =
  new InjectionToken<FlSvgIconConfig>('LF_SVG_ICON_MODULE');
