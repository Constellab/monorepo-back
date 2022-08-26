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

export const labConstResourceViewTypeInfos: Record<string, RvResourceViewTypeInfo> = {
  ...rvDefaultViewTypeInfos,
  // override the table view to add functionalities like chart from api
  'table-view': {
    icon: 'calendar_view_month',
    text: 'rvResourceView.resource_view_spreadsheet',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: true,
    viewComponent: LabResourceSpreadsheetComponent,
    image: 'assets/views/tabular.png'
  },
  // override the table view to add functionalities like chart from api
  'tabular-view': {
    icon: 'calendar_view_month',
    text: 'rvResourceView.resource_view_spreadsheet',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: true,
    viewComponent: LabResourceSpreadsheetComponent,
    image: 'assets/views/tabular.png'
  },
  // override the table view to add functionalities like chart from api
  'dataset-view': {
    icon: 'calendar_view_month',
    text: 'rvResourceView.resource_view_dataset_view',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: true,
    viewComponent: LabResourceSpreadsheetComponent,
    image: 'assets/views/tabular.png'
  },
  // override the text view to enable pagination
  'text-view': {
    icon: 'text_snippet',
    text: 'rvResourceView.resource_view_text',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false,
    viewComponent: LabResourceTextComponent,
    image: ''
  },
  view: {
    icon: 'view_quilt',
    text: 'biox.resource_view_base',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: null,
    image: ''
  },
  'resources-list-view': {
    icon: 'list',
    text: 'biox.resource_view_resources_list',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false,
    viewComponent: LabViewResourcesListComponent,
    image: ''
  },
  'folder-view': {
    icon: 'folder',
    text: 'biox.resource_view_folder',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false,
    viewComponent: LabResourceFolderComponent,
    image: ''
  }
};

