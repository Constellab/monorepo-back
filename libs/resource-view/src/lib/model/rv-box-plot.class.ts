import {
  FlChartBoxPlot,
  FlChartBoxPlotData,
  FlChartBoxPlotSerie,
  FlChartConfig,
  FlChartMultiSerie
} from '@monorepo/front-core-lib';
import {RvResourceViewBase} from './rv-resource-view.class';

export interface RvResourceViewBoxPlot extends RvResourceViewBase{
  type: 'box-plot-view';
  data: RvResourceViewBoxPlotData;
}

export interface RvResourceViewBoxPlotData {
  x_label: string;
  y_label: string;
  x_tick_labels?: string[];
  series: RvResourceViewBoxPlotSerie[];
}

export interface RvResourceViewBoxPlotSerie {
  name: string;
  data: {
    // x: number;
    max: number[];
    q1: number[];
    median: number[];
    min: number[];
    q3: number[];
    lower_whisker: number[];
    upper_whisker: number[];
    tags?: Record<string, string>[];
    // nb_of_data: number;
  };
}

/**
 * Function to convert the box plot view to a chart
 * @param view
 */
export function rvBoxPlotToChart(view: RvResourceViewBoxPlot): FlChartConfig {
  const series: FlChartMultiSerie<FlChartBoxPlotData> = new FlChartMultiSerie();

  let serieIndex: number = 1;
  for (const viewSerie of view.data.series) {
    const serie = new FlChartBoxPlotSerie([], viewSerie.name ?? serieIndex.toString());

    for (let i = 0; i < viewSerie.data.max.length; i++) {
      serie.addData({
        min: viewSerie.data.min[i],
        max: viewSerie.data.max[i],
        q1: viewSerie.data.q1[i],
        median: viewSerie.data.median[i],
        q3: viewSerie.data.q3[i],
        lowerWhisker: viewSerie.data.lower_whisker[i],
        upperWhisker: viewSerie.data.upper_whisker[i],
        tags: viewSerie.data.tags?.[i],
        valid: true
      });

      serieIndex++;
    }

    series.addSerie(serie);
  }

  if (view.data.x_tick_labels) {
    series.setXTickLabels(view.data.x_tick_labels);
  }
  return new FlChartBoxPlot(series);
}
