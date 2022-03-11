import {InjectionToken} from '@angular/core';

/**
 * Config for the {@link FlIconModule}
 */
export interface FlIconConfig {
  /**
   * path (in assets) of the svg icons
   */
  iconFolder: string;

  /**
   * List of icons to register
   */
  iconsToRegister: FlIcon[];
}

export type FlIcon = FlSvgIcon | FlMatIcon

/**
 * Information to register an SVG icons
 */
export interface FlSvgIcon {
  name: string;
  filename: string;
}

/**
 * Information to register an icon that used MatIcon (useful to rename an icon)
 */
export interface FlMatIcon {
  name: string;
  matIconName: string;
}

/**
 * @ignore
 * Use to inject the configuration of the svg icon module
 *
 * Use '@Inject(FL_ICON_MODULE)' to inject it in component or service
 */
export const FL_ICON_MODULE =
  new InjectionToken<FlIconConfig>('FL_ICON_MODULE');

/**
 * List of default icon
 */
export const flIconsDefault: FlIcon[] = [
  {name: 'experiment', filename: 'flask-solid.svg'},
  {name: 'protocol', filename: 'cogs-solid.svg'},
  {name: 'lab', filename: 'microscope-solid.svg'},
  {name: 'project', filename: 'briefcase-solid.svg'},
  {name: 'archive', filename: 'archive-solid.svg'},
  {name: 'report', matIconName: 'grading'},
  {name: 'resource', matIconName: 'folder'},
  {name: 'smart_db', matIconName: 'search'},
  {name: 'organization', matIconName: 'business'},

]
