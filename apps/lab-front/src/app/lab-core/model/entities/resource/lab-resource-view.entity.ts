import {Expose} from 'class-transformer';
import {LabResourceViewBoxPlot} from './lab-resource-view-box-plot.class';
import {LabResourceViewBasicPlot2d} from './lab-resource-view-basic-plot-2d.class';
import {LabResourceViewHeatMap} from './lab-resource-view-heat-map.class';
import {LabResourceViewHistogram} from './lab-resource-view-histogram.class';
import {LabResourceVennDiagram} from './lab-resource-venn-diagram.class';
import {LabTransformerWithConfig} from '../../global/lab-transformer.class';
import {LabConfigValues} from '../lab-config.entity';
import {LabResourceViewFolder} from './lab-resource-view-folder.class';

// list of available view type
export type LabResourceViewType =
  'view'
  | 'json-view'
  | 'folder-view'
  | 'text-view'
  | 'table-view' | 'dataset-view'
  | 'network-view'
  | 'image-view'
  | 'scatter-plot-2d-view' | 'line-plot-2d-view'
  | 'bar-plot-view' | 'stacked-bar-plot-view' | 'histogram-view'
  | 'box-plot-view'
  | 'multi-view'
  | 'venn-diagram-view'
  | 'heatmap-view';

// Mode to where display the view
export type LabResourceViewDisplayMode = 'fullScreen' | 'portal';

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

export class LabViewCallResult {
  @Expose({name: 'view_human_name'})
  viewHumanName: string;

  @Expose({name: 'view_short_description'})
  viewShortDescription: string;

  @Expose({name: 'view_data'})
  viewData: LabResourceView;
}

/**
 * Object that contains the resource view spec and its configuration
 */
export interface LabResourceViewSpecWithConfig {
  viewName: string;
  viewMethodName: string;
  isDefaultView: boolean;
  viewConfigValues: LabConfigValues;
  displayMode: LabResourceViewDisplayMode;
  transformersWithConfig: LabTransformerWithConfig[];
}

export interface LabResourceViewBase {
  type: LabResourceViewType;
  data: any;
  title?: string;
  caption?: string;
}

export interface LabResourceViewJson extends LabResourceViewBase {
  type: 'json-view';
  data: Record<string, any>;
}

// Spec name of the page on view text
export const labResourceViewTextSpecPage: string = 'page';

export interface LabResourceViewText extends LabResourceViewBase {
  type: 'text-view';
  data: {
    text: string
    is_first_page: boolean;
    is_last_page: boolean;
    last_page: number;
    next_page: number;
    number_of_items_per_page: number;
    page: number;
    prev_page: number;
    total_number_of_items: number;
    total_number_of_pages: number;
  };
}

export interface LabResourceViewTable extends LabResourceViewBase {
  type: 'table-view' | 'dataset-view';
  data: any[][];
  rows: LabResourceViewTableHeader[];
  columns: LabResourceViewTableHeader[];
}

export interface LabResourceViewTableHeader {
  name: string;
  tags: Record<string, string>;
}


export interface LabResourceViewNetwork extends LabResourceViewBase {
  type: 'network-view';
  data: any;
}

export interface LabResourceViewImage extends LabResourceViewBase {
  type: 'image-view';
  data: any;
}

export interface LabResourceViewMulti extends LabResourceViewBase {
  type: 'multi-view';
  data: LabResourceViewMultiData;
}

export interface LabResourceViewMultiData {
  nb_of_columns: number;
  views: {
    colspan: number;
    rowspan: number;
    view: LabResourceView;
  }[];
}

//////////////////////////// TYPE THAT GROUP ALL VIEW TYPES /////////////////////////////
export type LabResourceView =
  LabResourceViewJson
  | LabResourceViewMulti
  | LabResourceViewBoxPlot
  | LabResourceViewHistogram
  | LabResourceViewBasicPlot2d
  | LabResourceViewImage
  | LabResourceViewNetwork
  | LabResourceVennDiagram
  | LabResourceViewHeatMap
  | LabResourceViewText
  | LabResourceViewTable
  | LabResourceViewFolder;

// Information of the view type
export interface LabResourceViewTypeInfo {
  icon: string;
  text: string;
  // Where the view show in a portal or component by default
  defaultDisplayMode: LabResourceViewDisplayMode;
  // if true the default display mode can be modified
  forceDefaultDisplayMode: boolean;
}


//////////////////////////// VIEW STATIC INFO FOR EACH TYPE /////////////////////////////

// Record of view type, icon
export const labConstResourceViewTypeInfos: Record<LabResourceViewType, LabResourceViewTypeInfo> = {
  view: {
    icon: 'view_quilt',
    text: 'biox.resource_view_base',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false
  },
  'json-view': {
    icon: 'code',
    text: 'biox.resource_view_json',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false
  },
  'text-view': {
    icon: 'text_snippet',
    text: 'biox.resource_view_text',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false
  },
  'table-view': {
    icon: 'calendar_view_month',
    text: 'biox.resource_view_spreadsheet',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: true
  },
  'dataset-view': {
    icon: 'calendar_view_month',
    text: 'biox.resource_view_spreadsheet',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: true
  },
  'network-view': {
    icon: 'share',
    text: 'biox.resource_view_pathway',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: true
  },
  'image-view': {
    icon: 'insert_photo',
    text: 'biox.resource_view_image',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false
  },
  'scatter-plot-2d-view': {
    icon: 'scatter_plot',
    text: 'biox.resource_view_scatter_plot_2d',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false
  },
  'line-plot-2d-view': {
    icon: 'show_chart',
    text: 'biox.resource_view_line_plot_2d',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false
  },
  'bar-plot-view': {
    icon: 'bar_chart',
    text: 'biox.resource_view_bar_plot',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false
  },
  'stacked-bar-plot-view': {
    icon: 'stacked_bar_chart',
    text: 'biox.resource_view_stacked_bar_plot',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false
  },
  'histogram-view': {
    icon: 'bar_chart',
    text: 'biox.resource_view_histogram',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false
  },
  'box-plot-view': {
    icon: 'multiline_chart',
    text: 'biox.resource_view_box_plot',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false
  },
  'multi-view': {
    icon: 'multiline_chart',
    text: 'biox.resource_view_multi_views',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false
  },
  'venn-diagram-view': {
    icon: 'join_full',
    text: 'biox.resource_view_venn_diagram',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false
  },
  'heatmap-view': {
    icon: 'multiline_chart',
    text: 'biox.resource_view_heatmap',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false
  },
  'folder-view': {
    icon: 'folder',
    text: 'biox.resource_view_folder',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false
  },
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
