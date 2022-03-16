import {FlMenuDynamic} from '../../fl-menu-dynamic/model/fl-menu-dynamic.class';
import {FlChartConfig} from './fl-chart-config.class';

export interface FlChartPortalConfig {
  chart: FlChartConfig;

  contextMenuItems?: FlMenuDynamic[]
}


export enum FlChartType {
  LINE = 'LINE',
  SCATTER_PLOT = 'SCATTER_PLOT',
  BAR_PLOT = 'BAR_PLOT',
  HISTOGRAM = 'HISTOGRAM',
  STACKED_PLOT = 'STACKED_PLOT',
  BOX_PLOT = 'BOX_PLOT',
  HEAT_MAP = 'HEAT_MAP',
  VENN_DIAGRAM = 'VENN_DIAGRAM'
}

export interface FlChartTypeSelectOption {
  component: FlChartType;
  icon: string;
}

// list of available option for a chart select
export const flChartTypeSelectOptions: FlChartTypeSelectOption[] = [
  {
    component: FlChartType.LINE,
    icon: 'show_chart',
  },
  {
    component: FlChartType.SCATTER_PLOT,
    icon: 'scatter_plot'
  },
  {
    component: FlChartType.BAR_PLOT,
    icon: 'bar_chart'
  },
  {
    component: FlChartType.HISTOGRAM,
    icon: 'bar_chart'
  },
  {
    component: FlChartType.STACKED_PLOT,
    icon: 'stacked_bar_chart'
  },
  {
    component: FlChartType.BOX_PLOT,
    icon: 'multiline_chart'
  },
  {
    component: FlChartType.HEAT_MAP,
    icon: 'multiline_chart'
  },
  {
    component: FlChartType.VENN_DIAGRAM,
    icon: 'multiline_chart'
  }
];
