import {RvResourceViewType, RvViewDisplayMode} from './rv-resource-view.class';
import {ComponentType} from '@angular/cdk/overlay';
import {RvViewJsonComponent} from '../component/rv-view-json/rv-view-json.component';
import {RvViewChart2dComponent} from '../component/rv-view-chart-2d/rv-view-chart2d.component';
import {RvViewMultiViewsComponent} from '../component/rv-view-multi-views/rv-view-multi-views.component';
import {RvResourceViewDirective} from './rv-resource-view.directive';
import {RvViewNetworkComponent} from '../component/rv-view-network/rv-view-network.component';
import {RvViewSpreadsheetComponent} from '../component/rv-view-spreadsheet/rv-view-spreadsheet.component';
import {RvViewTextComponent} from '../component/rv-view-text/rv-view-text.component';
import {FlThemeSwitch} from '@monorepo/front-core-lib';

// Information of the view type
export interface RvResourceViewTypeInfo {
  icon: string;
  image: FlThemeSwitch<string>;
  text: string;
  // Whether the view show in a portal or component by default
  defaultDisplayMode: RvViewDisplayMode;
  // if true the default display mode can be modified
  forceDefaultDisplayMode: boolean;

  viewComponent: ComponentType<RvResourceViewDirective>;
}

/**
 * List of default views supported by the resource view library
 */
export const rvDefaultViewTypeInfos: Record<RvResourceViewType, RvResourceViewTypeInfo> = {
  'json-view': {
    icon: 'code',
    text: 'rvResourceView.resource_view_json',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewJsonComponent,
    image: null,
  },
  'text-view': {
    icon: 'text_snippet',
    text: 'rvResourceView.resource_view_text',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewTextComponent,
    image: null,
  },
  'table-view': {
    icon: 'calendar_view_month',
    text: 'rvResourceView.resource_view_spreadsheet',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: true,
    viewComponent: RvViewSpreadsheetComponent,
    image: {
      lightTheme: 'assets/views/light/tabular-view.svg',
      darkTheme: 'assets/views/dark/tabular-view.svg',
    }
  },
  'tabular-view': {
    icon: 'calendar_view_month',
    text: 'rvResourceView.resource_view_spreadsheet',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: true,
    viewComponent: RvViewSpreadsheetComponent,
    image: {
      lightTheme: 'assets/views/light/tabular-view.svg',
      darkTheme: 'assets/views/dark/tabular-view.svg',
    }
  },
  'dataset-view': {
    icon: 'calendar_view_month',
    text: 'rvResourceView.resource_view_dataset_view',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: true,
    viewComponent: RvViewSpreadsheetComponent,
    image: {
      lightTheme: 'assets/views/light/tabular-view.svg',
      darkTheme: 'assets/views/dark/tabular-view.svg',
    }
  },
  'network-view': {
    icon: 'share',
    text: 'rvResourceView.resource_view_pathway',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: true,
    viewComponent: RvViewNetworkComponent,
    image: {
      lightTheme: 'assets/views/light/network-view.svg',
      darkTheme: 'assets/views/dark/network-view.svg',
    }
  },
  'image-view': {
    icon: 'insert_photo',
    text: 'rvResourceView.resource_view_image',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: null,
    image: null,
  },
  'scatter-plot-2d-view': {
    icon: 'scatter_plot',
    text: 'rvResourceView.resource_view_scatter_plot_2d',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewChart2dComponent,
    image: {
      lightTheme: 'assets/views/light/scatter-plot.svg',
      darkTheme: 'assets/views/dark/scatter-plot.svg',
    }
  },
  'line-plot-2d-view': {
    icon: 'show_chart',
    text: 'rvResourceView.resource_view_line_plot_2d',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewChart2dComponent,
    image: {
      lightTheme: 'assets/views/light/line-plot.svg',
      darkTheme: 'assets/views/dark/line-plot.svg',
    }
  },
  'vulcano-plot-view': {
    icon: 'scatter_plot',
    text: 'rvResourceView.resource_view_vulcano_plot',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewChart2dComponent,
    image: {
      lightTheme: 'assets/views/light/scatter-plot.svg',
      darkTheme: 'assets/views/dark/scatter-plot.svg',
    }
  },
  'bar-plot-view': {
    icon: 'bar_chart',
    text: 'rvResourceView.resource_view_bar_plot',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewChart2dComponent,
    image: {
      lightTheme: 'assets/views/light/bar-plot.svg',
      darkTheme: 'assets/views/dark/bar-plot.svg',
    }
  },
  'stacked-bar-plot-view': {
    icon: 'stacked_bar_chart',
    text: 'rvResourceView.resource_view_stacked_bar_plot',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewChart2dComponent,
    image: {
      lightTheme: 'assets/views/light/stacked-bar-plot.svg',
      darkTheme: 'assets/views/dark/stacked-bar-plot.svg',
    }
  },
  'histogram-view': {
    icon: 'bar_chart',
    text: 'rvResourceView.resource_view_histogram',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewChart2dComponent,
    image: {
      lightTheme: 'assets/views/light/histogram.svg',
      darkTheme: 'assets/views/dark/histogram.svg',
    }
  },
  'box-plot-view': {
    icon: 'multiline_chart',
    text: 'rvResourceView.resource_view_box_plot',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewChart2dComponent,
    image: {
      lightTheme: 'assets/views/light/box-plot.svg',
      darkTheme: 'assets/views/dark/box-plot.svg',
    }
  },
  'multi-view': {
    icon: 'multiline_chart',
    text: 'rvResourceView.resource_view_multi_views',
    defaultDisplayMode: 'fullScreen',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewMultiViewsComponent,
    image: null
  },
  'venn-diagram-view': {
    icon: 'join_full',
    text: 'rvResourceView.resource_view_venn_diagram',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewChart2dComponent,
    image: {
      lightTheme: 'assets/views/light/venn-diagram.svg',
      darkTheme: 'assets/views/dark/venn-diagram.svg',
    }
  },
  'heatmap-view': {
    icon: 'multiline_chart',
    text: 'rvResourceView.resource_view_heatmap',
    defaultDisplayMode: 'portal',
    forceDefaultDisplayMode: false,
    viewComponent: RvViewChart2dComponent,
    image: {
      lightTheme: 'assets/views/light/heatmap.svg',
      darkTheme: 'assets/views/dark/heatmap.svg',
    }
  },
};

