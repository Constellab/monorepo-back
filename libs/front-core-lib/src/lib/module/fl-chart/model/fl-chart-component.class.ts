import {ComponentType} from '@angular/cdk/overlay';
import {FlChartLineMultipleComponent} from '../module/module/fl-chart-line/component/fl-chart-line-multiple/fl-chart-line-multiple.component';
import {FlChartScatterPlotMultipleComponent} from '../module/module/fl-chart-scatter-plot/component/fl-chart-scatter-plot-multiple/fl-chart-scatter-plot-multiple.component';


export interface FlChartComponent {
  data: any;
}

export interface FlChartDynamicConfig {
  data: any;

  component: ComponentType<FlChartComponent> | FlChartComponentType;
}


export enum FlChartComponentType {
  LINE = 'LINE',
  SCATTER_PLOT = 'SCATTER_PLOT'
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
  }, {
    component: FlChartComponentType.SCATTER_PLOT,
    icon: 'scatter_plot'
  }
];



/**
 * Function to convert ComponentType | FlChartComponentAvailable to ComponentType
 * @param component
 */
export function flChartComponentTypeFactory(component: ComponentType<FlChartComponent> | FlChartComponentType):
  ComponentType<FlChartComponent> {
  if (typeof component === 'string') {
    switch (component) {
      case FlChartComponentType.LINE:
        return FlChartLineMultipleComponent;
      case FlChartComponentType.SCATTER_PLOT:
        return FlChartScatterPlotMultipleComponent;
    }
  } else {
    return component;
  }
}
