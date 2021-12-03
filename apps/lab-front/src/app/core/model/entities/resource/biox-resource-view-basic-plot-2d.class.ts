import {
  FlChart2dDatum,
  FlChart2dMultiSerie,
  FlChartBarPlot,
  FlChartConfig,
  FlChartLine2d,
  FlChartScatterPlot2d,
  FlChartSerie,
  FlChartStackedBar
} from '@monorepo/front-core-lib';

export interface BioxResourceViewBasicPlot2d {
  type: 'scatter-plot-2d-view' | 'line-plot-2d-view' | 'bar-plot-view' | 'stacked-bar-plot-view';
  data: BioxResourceViewChart2dData;
}

export interface BioxResourceViewChart2dData {
  x_tick_labels?: string[]; // if provided, those values should be displayed as X
  x_label: string; // name of the x-axis
  y_label: string; // name of the y-axis
  series: BioxResourceViewChart2dSerie[];
}

export interface BioxResourceViewChart2dSerie {
  data: {
    x: number[];
    y: number[];
  };
  x_column_name?: string;
  y_column_name?: string;
  column_name?: string;
}

/**
 * Build a FlChart from a basic resource view
 * @param view
 */
export function bioxBasicPlotToChart(view: BioxResourceViewBasicPlot2d): FlChartConfig {
  const series: FlChart2dMultiSerie<FlChart2dDatum> = bioxResourceBuildBasicChart2d(view);

  switch (view.type) {
    case 'scatter-plot-2d-view':
      return new FlChartScatterPlot2d(series);
    case 'line-plot-2d-view':
      return new FlChartLine2d(series);
    case 'bar-plot-view':
      return new FlChartBarPlot(series);
    case 'stacked-bar-plot-view':
      return new FlChartStackedBar(series);
  }
}


function bioxResourceBuildBasicChart2d(view: BioxResourceViewBasicPlot2d): FlChart2dMultiSerie<FlChart2dDatum> {
  const series: FlChart2dMultiSerie<FlChart2dDatum> = new FlChart2dMultiSerie();

  for (const viewSerie of view.data.series) {
    const data: FlChart2dDatum[] = [];

    for (let i = 0; i < viewSerie.data.x.length; i++) {
      data.push(new FlChart2dDatum(viewSerie.data.x[i], viewSerie.data.y[i]));
    }

    series.addSerie(new FlChartSerie(data, viewSerie.y_column_name ?? viewSerie.column_name));
  }

  // if there are some tick labels
  if (view.data.x_tick_labels?.length > 0) {
    series.setXTickLabels(view.data.x_tick_labels);
  }

  return series;
}
