import {FlChart2dDatum, FlChartAxisTickFormat, FlChartData, FlChartDataContainer} from './fl-chart-data.class';
import {FlChartDataWithSerie, FlChartSerie, FlChartSerieWithColor} from './fl-chart-serie.class';
import {FlChartDomain} from '../fl-chart-domain.class';
import {FlChartScaleColor} from '../scale/fl-chart-scale-color.class';

/**
 * Object to manage multiple series
 */
export class FlChartMultiSerie<Data extends FlChartData> implements FlChartDataContainer<Data> {

  series: FlChartSerie<Data>[];

  /**
   * Function to format the x-axis labels
   */
  axisXLabelFormat: FlChartAxisTickFormat | null;

  /**
   * Function to format the y-axis labels
   */
  axisYLabelFormat: FlChartAxisTickFormat | null;

  constructor(series: FlChartSerie<Data>[] = []) {
    this.series = series;
  }

  // flatten the data of the series
  getData(): Data[] {
    const data: Data[] = [];
    this.series.forEach(serie => data.push(...serie.getData()));
    return data;
  }

  public addSerie(serie: FlChartSerie<Data>): void {
    // override the key of the serie with the index
    serie.key = this.series.length;
    this.series.push(serie);
  }

  public countSeries(): number {
    return this.series.length;
  }

  // return the biggest number of data for a serie
  public maxSerieDataCount(): number {
    return this.series.reduce(
      (p, c) => c.countData() > p?.countData() ?? 0 ? c : p)
      .countData();
  }

  // return the indexes of the complete domain (array from 0 to N)
  getDomainCompleteIndexes(): number[] {
    return FlChartDomain.getCompleteDomainIndex(this.getData().length);
  }

  // return the indexes of the complete domain of the biggest serie
  getBiggestSerieDomainCompleteIndexes(): number[] {
    return FlChartDomain.getCompleteDomainIndex(this.maxSerieDataCount());
  }

  /**
   * return an array of data with serie
   * The first array contains all the series first value,
   * the second array all the series second value ...
   */
  public invert(): FlChartDataWithSerie<Data>[][] {
    const max: number = this.maxSerieDataCount();

    const data: FlChartDataWithSerie<Data>[][] = [];
    for (let i = 0; i < max; i++) {
      const d: FlChartDataWithSerie<Data>[] = [];

      for (const serie of this.series) {
        d.push(serie.getDataWithSerieAt(i));
      }

      data.push(d);
    }

    return data;
  }


  // return an array of series keys
  public getSeriesKeys(): number[] {
    return this.series.map((v) => v.key);
  }

  /**
   * Set the list of x tick label for all the series. It defines the axisXLabelFormat
   * @param xTickLabels
   */
  public setXTickLabels(xTickLabels: string[]): void {
    if (xTickLabels) {
      this.axisXLabelFormat = (value) => (xTickLabels[value] ?? value).toString();
    }
  }

  /**
   * Set the list of y tick label for all the series. It defines the axisYLabelFormat
   * @param yTickLabels
   */
  public setYTickLabels(yTickLabels: string[]): void {
    if (yTickLabels) {
      this.axisYLabelFormat = (value) => (yTickLabels[value] ?? value).toString();
    }
  }

  public getSerieWithColors(colorScale: FlChartScaleColor): FlChartSerieWithColor[] {
    return this.series.map(serie => {
      return {
        name: serie.name,
        color: colorScale.getColor(serie.key)
      };
    });
  }
}


/**
 * Multiple series with 2d data
 */
export class FlChart2dMultiSerie<Data extends FlChart2dDatum> extends FlChartMultiSerie<Data> {

  getDomainXLinear(extendDomain: number = 0, minValue?: number, maxValue?: number): [number, number] {
    return FlChartDomain.getLinearDomain(this.getData().map(data => data.getX()), extendDomain, minValue, maxValue);
  }

  getDomainXComplete(): number[] {
    return FlChartDomain.getCompleteDomain(this.getData().map(data => data.getX()));
  }

  getDomainYLinear(extendDomain: number = 0, minValue?: number, maxValue?: number): [number, number] {
    return FlChartDomain.getLinearDomain(this.getData().map(data => data.getY()), extendDomain, minValue, maxValue);
  }

  getDomainYComplete(): number[] {
    return FlChartDomain.getCompleteDomain(this.getData().map(data => data.getY()));
  }

  getDomainYStacked(extendDomain: number = 0, minValue?: number, maxValue?: number): [number, number] {
    const data: number[] = [];
    for (const serie of this.series) {
      const serieData = serie.getData();
      for (let i = 0; i < serieData.length; i++) {
        if (data[i] == null) {
          data[i] = serieData[i].getY();
        } else {
          data[i] += serieData[i].getY();
        }
      }
    }

    return FlChartDomain.getLinearDomain(data, extendDomain, minValue, maxValue);
  }

  /**
   * Group the series data by X
   * The first array contains all the series value corresponding to X = 0,
   * the second array all the series value where X = 1 ...
   */
  public groupByX(): FlChartDataWithSerie<Data>[][] {
    const maxX: number = this.getMaxSerieX();

    const data: FlChartDataWithSerie<Data>[][] = [];
    for (let i = 0; i <= maxX; i++) {
      const d: FlChartDataWithSerie<Data>[] = [];

      for (const serie of this.series) {
        const data = serie.getData().find(d => d.getX() === i);

        if (data) {
          d.push({
            data: data,
            serieKey: serie.key,
            serieName: serie.name
          });
        }
      }

      data.push(d);
    }

    return data;
  }

  public getMaxSerieX(): number {
    this.series[0].getData().map(d => d.getX());

    let maxX = 0;
    for (const serie of this.series) {
      const x = Math.max(...serie.getData().map(d => d.getX(0)));
      if (x > maxX) maxX = x;
    }
    return maxX;
  }


}
