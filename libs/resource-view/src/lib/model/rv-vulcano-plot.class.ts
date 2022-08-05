import {FlChart2dDatum, FlChart2dMultiSerie, FlChartConfig, FlChartVulcanoPlot} from '@monorepo/front-core-lib';
import {RvResourceViewBase} from './rv-resource-view.class';
import {rvResourceBuildBasicChart2d, RvResourceViewChart2dData} from './rv-basic-plot-2d.class';


export interface RvResourceViewVulcanoPlot extends RvResourceViewBase {
  type: 'vulcano-plot-view';
  data: RvResourceViewVulcanoPlotData;
}

export interface RvResourceViewVulcanoPlotData extends RvResourceViewChart2dData {
  x_threshold: number;
  y_threshold: number;
}


/**
 * Build a FlChart from a vulcano resource view
 */
export function rvVulcanoPlotToChart(view: RvResourceViewVulcanoPlot): FlChartConfig {
  const series: FlChart2dMultiSerie<FlChart2dDatum> = rvResourceBuildBasicChart2d(view.data);


  return new FlChartVulcanoPlot(series, view.data.x_threshold, view.data.y_threshold);
}
