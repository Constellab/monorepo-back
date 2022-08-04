// Record of view type, icon
import {rvDefaultViewTypeInfos, RvResourceViewTypeInfo} from '@monorepo/resource-view';
import {
  LabResourceSpreadsheetComponent
} from '../../../entity-module/lab-resource-core/component/lab-resource-spreadsheet/lab-resource-spreadsheet.component';
import {
  LabResourceTextComponent
} from '../../../entity-module/lab-resource-core/component/lab-resource-text/lab-resource-text.component';
import {
  LabViewResourcesListComponent
} from '../../../entity-module/lab-resource-core/component/lab-view-resources-list/lab-view-resources-list.component';
import {
  LabResourceFolderComponent
} from '../../../entity-module/lab-resource-core/component/lab-resource-folder/lab-resource-folder.component';
import {LabResourceViewSpec, LabResourceViewType, LabResourceViewTypeInfo} from './lab-resource-view.entity';

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
  // override the table view to add functionalities like chart from api
  'tabular-view': {
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
    viewComponent: LabViewResourcesListComponent
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
