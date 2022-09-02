import {Expose, Type} from 'class-transformer';
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
import {LabViewConfig} from './lab-view-config.entity';
import {LabConfigSpecs} from '../lab-config-spec.entity';
import {ClRecordWrapperTransform} from '@monorepo/core-lib';

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

export class LabResourceViewSpecComplete extends LabResourceViewSpec{

  @Expose({name: 'config_specs'})
  @ClRecordWrapperTransform(LabConfigSpecs)
  configSpecs: LabConfigSpecs;
}

/**
 * Object that contains the resource view spec and its configuration
 */
export interface LabResourceViewSpecWithConfig {
  viewName: string;
  viewMethodName: string;
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

export class LabResourceView {

  view: LabResourceViewData;

  @Expose({name: 'resource_id'})
  resourceId: string;

  @Expose({name: 'view_config'})
  @Type(() => LabViewConfig)
  viewConfig: LabViewConfig;
}

//////////////////////////// TYPE THAT GROUP ALL VIEW TYPES /////////////////////////////
export type LabResourceViewData = RvResourceView | LabResourceViewResourcesList | LabResourceViewFolder;

