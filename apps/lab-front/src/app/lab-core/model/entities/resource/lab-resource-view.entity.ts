import {Expose} from 'class-transformer';
import {LabTransformerWithConfig} from '../../global/lab-transformer.class';
import {LabConfigValues} from '../lab-config.entity';
import {
  RvResourceView,
  RvResourceViewBase,
  RvResourceViewType,
  RvTransformerParams,
  RvViewDisplayMode
} from '@monorepo/resource-view';
import {LabResourceViewFolder} from './lab-resource-view-folder.class';

// list of available view type
export type LabResourceViewType = RvResourceViewType | 'view'
  | 'resources-list-view' | 'folder-view';

export class LabResourceViewSpec {
  @Expose({name: 'method_name'})
  methodName: string;

  @Expose({name: 'view_type'})
  viewType: LabResourceViewType;

  @Expose({name: 'human_name'})
  humanName: string;

  @Expose({name: 'short_description'})
  shortDescription: string;

  @Expose({name: 'default_view'})
  defaultView: boolean;

  getName(): string {
    return this.humanName ?? this.methodName;
  }
}

/**
 * Object that contains the resource view spec and its configuration
 */
export interface LabResourceViewSpecWithConfig {
  resourceId: string;
  viewName: string;
  viewMethodName: string;
  isDefaultView: boolean;
  viewConfigValues: LabConfigValues;
  displayMode: RvViewDisplayMode;
  transformersWithConfig: LabTransformerWithConfig[];
}

export interface LabResourceViewConfig {
  methodName: string;
  configValues: LabConfigValues;
  transformers: RvTransformerParams[];
}

/**
 * View that list other resources
 */
export interface LabResourceViewResourcesList extends RvResourceViewBase {
  type: 'resources-list-view';
  data: any[]; // list of LabResource
}

//////////////////////////// TYPE THAT GROUP ALL VIEW TYPES /////////////////////////////
export type LabResourceView = RvResourceView | LabResourceViewResourcesList | LabResourceViewFolder;

// Information of the view type
export interface LabResourceViewTypeInfo {
  icon: string;
  text: string;
  // Where the view show in a portal or component by default
  defaultDisplayMode: RvViewDisplayMode;
  // if true the default display mode can be modified
  forceDefaultDisplayMode: boolean;
}


