import {
  FlChartBoxPlot,
  FlChartBoxPlotData,
  FlChartBoxPlotSerie,
  FlChartConfig,
  FlChartMultiSerie
} from '@monorepo/front-core-lib';

export interface BioxResourceViewBoxPlot {
  type: 'box-plot-view';
  data: BioxResourceViewBoxPlotData;
}

export interface BioxResourceViewBoxPlotData {
  x_label: string;
  y_label: string;
  x_tick_labels?: string[];
  series: BioxResourceViewBoxPlotSerie[];
}

export interface BioxResourceViewBoxPlotSerie {
  column_names: string[];
  data: {
    // x: number;
    max: number[];
    q1: number[];
    median: number[];
    min: number[];
    q3: number[];
    lower_whisker: number[];
    upper_whisker: number[];
    // nb_of_data: number;
  };
}

/**
 * Function to convert the box plot view to a chart
 * @param view
 */
export function bioxBoxPlotToChart(view: BioxResourceViewBoxPlot): FlChartConfig {
  const series: FlChartMultiSerie<FlChartBoxPlotData> = new FlChartMultiSerie();

  for (const viewSerie of view.data.series) {
    const serie = new FlChartBoxPlotSerie([], viewSerie.column_names.join(' '));

    for (let i = 0; i < viewSerie.data.max.length; i++) {
      serie.addData({
        min: viewSerie.data.min[i],
        max: viewSerie.data.max[i],
        q1: viewSerie.data.q1[i],
        median: viewSerie.data.median[i],
        q3: viewSerie.data.q3[i],
        lowerWhisker: viewSerie.data.lower_whisker[i],
        upperWhisker: viewSerie.data.upper_whisker[i],
      });
    }

    series.addSerie(serie);
  }

  if (view.data.x_tick_labels) {
    series.setXTickLabels(view.data.x_tick_labels);
  }
  return new FlChartBoxPlot(series);
}
