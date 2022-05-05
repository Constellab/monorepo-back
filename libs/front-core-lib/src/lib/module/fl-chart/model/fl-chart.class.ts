import {FlMenuDynamic} from '../../fl-menu-dynamic/model/fl-menu-dynamic.class';
import {FlChartConfig} from './fl-chart-config.class';

export interface FlChartPortalConfig {
  chart: FlChartConfig;

  contextMenuItems?: FlMenuDynamic[];
}


export enum FlChartType {
  LINE = 'LINE',
  SCATTER_PLOT = 'SCATTER_PLOT',
  BAR_PLOT = 'BAR_PLOT',
  STACKED_PLOT = 'STACKED_PLOT',
  HISTOGRAM = 'HISTOGRAM',
  BOX_PLOT = 'BOX_PLOT',
  HEAT_MAP = 'HEAT_MAP',
  VENN_DIAGRAM = 'VENN_DIAGRAM'
}

export const flChartTypeIcons: Record<FlChartType, string> = {
  LINE: 'show_chart',
  SCATTER_PLOT: 'scatter_plot',
  BAR_PLOT: 'bar_chart',
  STACKED_PLOT: 'stacked_bar_chart',
  HISTOGRAM: 'bar_chart',
  BOX_PLOT: 'multiline_chart',
  HEAT_MAP: 'grid_on',
  VENN_DIAGRAM: 'join_full'
};
