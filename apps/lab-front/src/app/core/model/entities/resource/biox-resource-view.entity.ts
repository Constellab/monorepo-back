import {Expose} from 'class-transformer';
import {ClCsvJson, ClHelpService, ClRecordWrapperTransform} from '@monorepo/core-lib';
import {BioxConfigSpecBase, BioxConfigSpecs} from '../biox-config-spec.entity';
import {BioxResourceViewBoxPlot} from './biox-resource-view-box-plot.class';
import {BioxResourceViewBasicPlot2d} from './biox-resource-view-basic-plot-2d.class';
import {BioxResourceViewHeatMap} from './biox-resource-view-heat-map.class';
import {BioxResourceViewHistogram} from './biox-resource-view-histogram.class';
import {BioxResourceVennDiagram} from './biox-resource-venn-diagram.class';
import {BioxTransformerWithConfig} from '../../global/biox-transformer.class';

// list of available view type
export type BioxResourceViewType =
  'view'
  | 'json-view'
  | 'text-view'
  | 'table-view'
  | 'network-view'
  | 'image-view'
  | 'scatter-plot-2d-view'
  | 'line-plot-2d-view'
  | 'bar-plot-view'
  | 'stacked-bar-plot-view'
  | 'histogram-view'
  | 'box-plot-view'
  | 'multi-view'
  | 'venn-diagram-view'
  | 'heatmap-view';

// Mode to where display the view
export type BioxResourceViewDisplayMode = 'fullScreen' | 'portal';

export class BioxResourceViewSpec {
  @Expose({name: 'method_name'})
  methodName: string;

  @Expose({name: 'view_type'})
  viewType: BioxResourceViewType;

  @Expose({name: 'human_name'})
  humanName: string;

  @Expose({name: 'short_description'})
  shortDescription: string;

  // object describing the type of the configs and default values of the view
  @Expose({name: 'view_specs'})
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecBase)
  viewSpecs: BioxConfigSpecs;

  // object describing the type of the configs and default values of the view methods
  @Expose({name: 'method_specs'})
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecBase)
  methodSpecs: BioxConfigSpecs;

  // object describing the type of the configs and default values of the view methods
  @ClRecordWrapperTransform(BioxConfigSpecs, BioxConfigSpecBase)
  specs: BioxConfigSpecs;

  @Expose({name: 'default_view'})
  defaultView: boolean;

  getName(): string {
    return this.humanName ?? this.methodName;
  }
}

/**
 * Object that contains the resource view spec and its configuration
 */
export interface BioxResourceViewSpecWithConfig {
  viewSpec: BioxResourceViewSpec;
  viewConfig: BioxResourceViewConfig;
  displayMode: BioxResourceViewDisplayMode;
  transformersWithConfig: BioxTransformerWithConfig[];
}

export class BioxResourceViewConfig {
  @Expose({name: 'config_values'})
  configValues: Record<string, any>;

  constructor(config: Record<string, any> = {}) {
    this.configValues = config;
  }

  public clone(): BioxResourceViewConfig {
    return new BioxResourceViewConfig(ClHelpService.deepClone(this.configValues));
  }

}


export interface BioxResourceViewJson {
  type: 'json-view';
  data: Record<string, any>;
}

// Spec name of the page on view text
export const bioxResourceViewTextSpecPage: string = 'page';

export interface BioxResourceViewText {
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

export interface BioxResourceViewTable {
  type: 'table-view';
  data: ClCsvJson;
}

export interface BioxResourceViewNetwork {
  type: 'network-view';
  data: any;
}

export interface BioxResourceViewImage {
  type: 'image-view';
  data: any;
}

export interface BioxResourceViewMulti {
  type: 'multi-view';
  data: BioxResourceViewMultiData;
}

export interface BioxResourceViewMultiData {
  nb_of_columns: number;
  views: {
    colspan: number;
    rowspan: number;
    view: BioxResourceView;
  }[];
}

//////////////////////////// TYPE THAT GROUP ALL VIEW TYPES /////////////////////////////
export type BioxResourceView =
  BioxResourceViewJson
  | BioxResourceViewMulti
  | BioxResourceViewBoxPlot
  | BioxResourceViewHistogram
  | BioxResourceViewBasicPlot2d
  | BioxResourceViewImage
  | BioxResourceViewNetwork
  | BioxResourceVennDiagram
  | BioxResourceViewHeatMap
  | BioxResourceViewText
  | BioxResourceViewTable;

// Information of the view type
export interface BioxResourceViewTypeInfo {
  icon: string;
  text: string;
  // Where the view show in a portal or component by default
  defaultDisplayMode: BioxResourceViewDisplayMode;
  // if true the default display mode can be modified
  forceDefaultDisplayMode: boolean;
}


//////////////////////////// VIEW STATIC INFO FOR EACH TYPE /////////////////////////////

// Record of view type, icon
export const constBioxResourceViewTypeInfos: Record<BioxResourceViewType, BioxResourceViewTypeInfo> = {
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
};

/**
 * Object that group view specs by type
 */
export interface BioxResourceViewSpecsByType {
  viewTypeInfo: BioxResourceViewTypeInfo;
  viewSpec: BioxResourceViewSpec[];
}

export function bioxGroupResourceViewSpecsByType(views: BioxResourceViewSpec[]): BioxResourceViewSpecsByType[] {
  const viewsByType: Record<string, BioxResourceViewSpecsByType> = {};

  for (const view of views) {
    // get the type with 'view' by default if the type is not known
    const type: BioxResourceViewType = constBioxResourceViewTypeInfos[view.viewType] != null ? view.viewType : 'view';

    if (viewsByType[type] == null) {
      const viewTypeInfo = constBioxResourceViewTypeInfos[type];

      viewsByType[type] = {
        viewTypeInfo: viewTypeInfo,
        viewSpec: []
      };
    }

    viewsByType[type].viewSpec.push(view);
  }

  return Object.values(viewsByType);
}
