import {Expose} from 'class-transformer';
import {LabCallTransformerParams, LabTransformerWithConfig} from '../../global/lab-transformer.class';
import {LabConfigValues} from '../lab-config.entity';
import {
  rvDefaultViewTypeInfos,
  RvResourceView,
  RvResourceViewBase,
  RvResourceViewType,
  RvResourceViewTypeInfo,
  RvViewDisplayMode
} from '@monorepo/resource-view';
import {
  LabResourcesListComponent
} from '../../../entity-module/lab-resource-core/component/lab-resources-list/lab-resources-list.component';
import {
  LabResourceSpreadsheetComponent
} from '../../../entity-module/lab-resource-core/component/lab-resource-spreadsheet/lab-resource-spreadsheet.component';
import {
  LabResourceTextComponent
} from '../../../entity-module/lab-resource-core/component/lab-resource-text/lab-resource-text.component';
import {
  LabResourceFolderComponent
} from '../../../entity-module/lab-resource-core/component/lab-resource-folder/lab-resource-folder.component';
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
  transformers: LabCallTransformerParams[];
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


//////////////////////////// VIEW STATIC INFO FOR EACH TYPE /////////////////////////////

// Record of view type, icon
export const labConstResourceViewTypeInfos: Record<string, RvResourceViewTypeInfo> = {
  ...rvDefaultViewTypeInfos,
  // override the table view to add functionalities like chart from api
  'table-view': {
    icon: 'calendar_view_month',
    text: 'biox.resource_view_spreadsheet',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: true,
    viewComponent: LabResourceSpreadsheetComponent,
  },
  // override the text view to enable pagination
  'text-view': {
    icon: 'text_snippet',
    text: 'biox.resource_view_text',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false,
    viewComponent: LabResourceTextComponent,
  },
  view: {
    icon: 'view_quilt',
    text: 'biox.resource_view_base',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: null,
  },
  'resources-list-view': {
    icon: 'list',
    text: 'biox.resource_view_resources_list',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false,
    viewComponent: LabResourcesListComponent
  },
  'folder-view': {
    icon: 'folder',
    text: 'biox.resource_view_folder',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false,
    viewComponent: LabResourceFolderComponent,
  }
};


/**
 * Object that group view specs by type
 */
export interface LabResourceViewSpecsByType {
  viewTypeInfo: LabResourceViewTypeInfo;
  viewSpec: LabResourceViewSpec[];
}

export function labGroupResourceViewSpecsByType(views: LabResourceViewSpec[]): LabResourceViewSpecsByType[] {
  const viewsByType: Record<string, LabResourceViewSpecsByType> = {};

  for (const view of views) {
    // get the type with 'view' by default if the type is not known
    const type: LabResourceViewType = labConstResourceViewTypeInfos[view.viewType] != null ? view.viewType : 'view';

    if (viewsByType[type] == null) {
      const viewTypeInfo = labConstResourceViewTypeInfos[type];

      viewsByType[type] = {
        viewTypeInfo: viewTypeInfo,
        viewSpec: []
      };
    }

    viewsByType[type].viewSpec.push(view);
  }

  return Object.values(viewsByType);
}
