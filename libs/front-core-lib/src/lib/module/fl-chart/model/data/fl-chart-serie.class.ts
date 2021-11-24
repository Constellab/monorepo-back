import {FlChartDataContainer} from './fl-chart-data.class';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Key to distingue a serie form another
 */
export interface FlChartDataWithSerie<T> {
  data: T;
  serieKey: number;
  serieName: string;
}


export class FlChartSerie<Data> implements FlChartDataContainer<Data> {

  private static key: number = 0;

  data: Data[];

  key: number;

  name: string;

  constructor(data: Data[], serieName: string) {
    this.data = data;
    this.key = FlChartSerie.key++;
    this.name = serieName;
  }

  public getDataWithSerie(): FlChartDataWithSerie<Data>[] {
    return this.getData().map(data => {
      return {
        data: data,
        serieKey: this.key,
        serieName: this.name
      };
    });
  }

  public getDataWithSerieAt(index: number): FlChartDataWithSerie<Data> {
    return {
      data: this.getData()[index] ?? null,
      serieKey: this.key,
      serieName: this.name
    };
  }

  public countData(): number {
    return this.data.length;
  }

  public getData(): Data[] {
    return this.data;
  }

  public addData(data: Data | Data[]): void {
    const dataArray = ClHelpService.convertObjectOrArrayToArray(data)
    this.data.push(...dataArray)
  }
}
