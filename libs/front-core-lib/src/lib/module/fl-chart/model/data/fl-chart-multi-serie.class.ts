import {FlChart2dDatum, FlChartAxisTickFormat, FlChartDataContainer} from './fl-chart-data.class';
import {FlChartDataWithSerie, FlChartSerie} from './fl-chart-serie.class';
import {FlChartDomain} from '../fl-chart-domain.class';

/**
 * Object to manage multiple series
 */
export class FlChartMultiSerie<Data> implements FlChartDataContainer<Data> {

  series: FlChartSerie<Data>[];

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
}


/**
 * Multiple series with 2d data
 */
export class FlChart2dMultiSerie<Data extends FlChart2dDatum> extends FlChartMultiSerie<Data> {


  /**
   * Function to format the x axis labels
   */
  axisXLabelFormat: FlChartAxisTickFormat | null;

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

  getDomainYStacked(): [number, number] {
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

    return FlChartDomain.getLinearDomain(data);
  }

  // return the indexes of the complete domain (array from 0 to N)
  getDomainCompleteIndex(): number[] {
    return FlChartDomain.getCompleteDomainIndex(this.getData().length);
  }

  // return the indexes of the complete domain of the biggest serie
  getBiggestSerieDomainCompleteIndex(): number[] {
    return FlChartDomain.getCompleteDomainIndex(this.maxSerieDataCount());
  }
}
