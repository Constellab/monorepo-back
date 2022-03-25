import {
  FlChart2dMultiSerie,
  FlChartConfig,
  FlChartDataBin,
  FlChartHistogram,
  FlChartSerie
} from '@monorepo/front-core-lib';
import {LabResourceViewBase} from './lab-resource-view.entity';

export interface LabResourceViewHistogram extends LabResourceViewBase{
  type: 'histogram-view';
  data: LabResourceViewHistogramData;
}

export interface LabResourceViewHistogramData {
  y_label: string;
  x_tick_labels?: string[];
  series: LabResourceViewHistogramSerie[];
}

export interface LabResourceViewHistogramSerie {
  data: {
    x: number[];// list of bin interval (two side values represent an interval), one more value than hist
    y: number[];// list of hist values, number of values per interval
  };
  name: string;
}

/**
 * Convert a resource histogram view to a Chart
 * @param view
 */
export function labHistogramToChart(view: LabResourceViewHistogram): FlChartConfig {
  const series: FlChart2dMultiSerie<FlChartDataBin> = new FlChart2dMultiSerie();

  for (const viewSerie of view.data.series) {
    const data: FlChartDataBin[] = [];

    for (let i = 0; i < viewSerie.data.x.length - 1; i++) {
      // create the bin
      const min = viewSerie.data.x[i];
      const max = viewSerie.data.x[i + 1];
      data.push(new FlChartDataBin(i, viewSerie.data.y[i], min, max));
    }

    series.addSerie(new FlChartSerie(data, viewSerie.name));
  }


  // set the axisXLabelFormat but taking the interval text of the first serie
  series.axisXLabelFormat = (_: number, index: number) => {
    const dataHisto: FlChartDataBin = series.series[0].data[index];
    return dataHisto.getIntervalText();
  };

  return new FlChartHistogram(series);
}
