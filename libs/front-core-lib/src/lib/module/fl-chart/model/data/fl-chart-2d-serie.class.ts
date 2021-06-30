import {FlChart2dDataContainer, FlChart2dDatum} from './fl-chart-2d-data.class';

/**
 * Key to distingue a serie form another
 */
export interface FlChartDataWithSerie {
  data: FlChart2dDatum;
  serieKey: number;
  serieName: string;
}


export class FlChart2dSerie<Data extends FlChart2dDatum> extends FlChart2dDataContainer<Data> {

  private static key: number = 0;

  key: number;

  name: string;

  constructor(data: Data[], serieName: string) {
    super(data);
    this.key = FlChart2dSerie.key++;
    this.name = serieName;
  }

  public getDataWithSerie(): FlChartDataWithSerie[] {
    return this.getData().map(data => {
      return {
        data: data,
        serieKey: this.key,
        serieName: this.name
      };
    });
  }

  public getDataWithSerieAt(index: number): FlChartDataWithSerie {
    return {
      data: this.getData()[index] ?? null,
      serieKey: this.key,
      serieName: this.name
    };
  }

  public countData(): number {
    return this.data.length;
  }

}
