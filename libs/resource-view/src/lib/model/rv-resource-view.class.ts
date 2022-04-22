import {RvTechnicalInfo} from './rv-technical-info.class';
import {RvResourceViewBoxPlot} from './rv-box-plot.class';
import {RvResourceViewHistogram} from './rv-histogram.class';
import {RvResourceViewBasicPlot2d} from './rv-basic-plot-2d.class';
import {RvResourceVennDiagram} from './rv-venn-diagram.class';
import {RvResourceViewHeatMap} from './rv-heat-map.class';
import {RvResourceViewFolder} from './rv-folder.class';

// list of available view type
export type RvResourceViewType =
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
  | 'heatmap-view'
  | 'resources-list-view';

// Mode to where display the view
export type RvViewDisplayMode = 'fullScreen' | 'portal';


export interface RvResourceViewBase {
  type: RvResourceViewType;
  data: any;
  title?: string;
  technical_info?: RvTechnicalInfo[];
}

export interface RvResourceViewJson extends RvResourceViewBase {
  type: 'json-view';
  data: Record<string, any>;
}

// Spec name of the page on view text
export const labResourceViewTextSpecPage: string = 'page';

export interface RvResourceViewText extends RvResourceViewBase {
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

export interface RvResourceViewTable extends RvResourceViewBase {
  type: 'table-view' | 'dataset-view';
  data: RvResourceViewTableData;
}

export interface RvResourceViewTableData {
  table: any[][];
  rows: RvResourceViewTableHeader[];
  columns: RvResourceViewTableHeader[];
  from_column: number;
  from_row: number;
  number_of_columns_per_page: number;
  number_of_rows_per_page: number;
  total_number_of_columns: number;
  total_number_of_rows: number;
}

export interface RvResourceViewTableHeader {
  name: string;
  tags: Record<string, string>;
}


export interface RvResourceViewNetwork extends RvResourceViewBase {
  type: 'network-view';
  data: any;
}

export interface RvResourceViewImage extends RvResourceViewBase {
  type: 'image-view';
  data: any;
}

/**
 * View that list other resources
 */
export interface RvResourceViewResourcesList extends RvResourceViewBase {
  type: 'resources-list-view';
  data: any[]; // list of RvResource
}

export interface RvResourceViewMulti extends RvResourceViewBase {
  type: 'multi-view';
  data: RvResourceViewMultiData;
}

export interface RvResourceViewMultiData {
  nb_of_columns: number;
  views: {
    colspan: number;
    rowspan: number;
    view: RvResourceView;
  }[];
}

//////////////////////////// TYPE THAT GROUP ALL VIEW TYPES /////////////////////////////
export type RvResourceView =
  RvResourceViewJson
  | RvResourceViewMulti
  | RvResourceViewBoxPlot
  | RvResourceViewHistogram
  | RvResourceViewBasicPlot2d
  | RvResourceViewImage
  | RvResourceViewNetwork
  | RvResourceVennDiagram
  | RvResourceViewHeatMap
  | RvResourceViewText
  | RvResourceViewTable
  | RvResourceViewFolder
  | RvResourceViewResourcesList;



//////////////////////////// VIEW STATIC INFO FOR EACH TYPE /////////////////////////////

// Information of the view type
export interface RvResourceViewTypeInfo {
  icon: string;
  text: string;
  // Where the view show in a portal or component by default
  defaultDisplayMode: RvViewDisplayMode;
  // if true the default display mode can be modified
  forceDefaultDisplayMode: boolean;
}

// Record of view type, icon
export const rvConstResourceViewTypeInfos: Record<RvResourceViewType, RvResourceViewTypeInfo> = {
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
    text: 'biox.resource_view_dataset_view',
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
  'resources-list-view': {
    icon: 'list',
    text: 'biox.resource_view_resources_list',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false
  },
};
