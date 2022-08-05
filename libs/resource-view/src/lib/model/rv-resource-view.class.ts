import {RvTechnicalInfo} from './rv-technical-info.class';
import {RvResourceViewBoxPlot} from './rv-box-plot.class';
import {RvResourceViewHistogram} from './rv-histogram.class';
import {RvResourceViewBasicPlot2d} from './rv-basic-plot-2d.class';
import {RvResourceVennDiagram} from './rv-venn-diagram.class';
import {RvResourceViewHeatMap} from './rv-heat-map.class';
import {RvResourceViewTable} from './rv-table.class';
import {RvResourceViewVulcanoPlot} from './rv-vulcano-plot.class';

// list of available view type
export type RvResourceViewType =
  'json-view'
  | 'text-view'
  | 'table-view' | 'dataset-view' | 'tabular-view'
  | 'network-view'
  | 'image-view'
  | 'scatter-plot-2d-view' | 'line-plot-2d-view' | 'vulcano-plot-view'
  | 'bar-plot-view' | 'stacked-bar-plot-view' | 'histogram-view'
  | 'box-plot-view'
  | 'multi-view'
  | 'venn-diagram-view'
  | 'heatmap-view';

// Mode to where display the view
export type RvViewDisplayMode = 'fullScreen' | 'portal';


export interface RvResourceViewBase {
  type: RvResourceViewType | string;
  data: any;
  title?: string;
  technical_info?: RvTechnicalInfo[];
}

export interface RvResourceViewJson extends RvResourceViewBase {
  type: 'json-view';
  data: Record<string, any>;
}

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

export interface RvResourceViewNetwork extends RvResourceViewBase {
  type: 'network-view';
  data: any;
}

export interface RvResourceViewImage extends RvResourceViewBase {
  type: 'image-view';
  data: any;
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
  | RvViewChartType
  | RvResourceViewImage
  | RvResourceViewNetwork
  | RvResourceViewText
  | RvResourceViewTable;

export type RvViewChartType =
  RvResourceViewBasicPlot2d
  | RvResourceViewBoxPlot
  | RvResourceViewHeatMap
  | RvResourceViewHistogram
  | RvResourceVennDiagram
  | RvResourceViewVulcanoPlot;
