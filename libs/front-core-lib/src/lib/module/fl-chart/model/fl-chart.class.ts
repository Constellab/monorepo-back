
export interface FlChartDynamicConfig {
  data: any;

  chartType: FlChartType;
}


export enum FlChartType {
  LINE = 'LINE',
  SCATTER_PLOT = 'SCATTER_PLOT',
  BAR_PLOT = 'BAR_PLOT',
  HISTOGRAM = 'HISTOGRAM',
  BOX_PLOT = 'BOX_PLOT'
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
    component: FlChartType.BOX_PLOT,
    icon: 'multiline_chart'
  }
];
