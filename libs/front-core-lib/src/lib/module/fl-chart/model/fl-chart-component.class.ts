export interface FlChartComponent {
  data: any;
}

export interface FlChartDynamicConfig {
  data: any;

  chartType: FlChartComponentType;
}


export enum FlChartComponentType {
  LINE = 'LINE',
  SCATTER_PLOT = 'SCATTER_PLOT',
  HISTOGRAM = 'HISTOGRAM'
}

export interface FlChartComponentTypeSelectOption {
  component: FlChartComponentType;
  icon: string;
}

// list of available option for a chart select
export const flChartComponentTypeSelectOptions: FlChartComponentTypeSelectOption[] = [
  {
    component: FlChartComponentType.LINE,
    icon: 'show_chart',
  },
  {
    component: FlChartComponentType.SCATTER_PLOT,
    icon: 'scatter_plot'
  },
  {
    component: FlChartComponentType.HISTOGRAM,
    icon: 'bar_chart'
  }
];
