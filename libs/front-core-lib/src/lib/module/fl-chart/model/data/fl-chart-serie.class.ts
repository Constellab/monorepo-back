import {FlChartData, FlChartDataContainer} from './fl-chart-data.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlLegend} from '../legend/fl-chart-legend-multi-series.class';
import {FlTagHelper} from '../../../fl-tag/fl-tag.class';

/**
 * Key to distinguish a serie form another
 */
export interface FlChartDataWithSerie<T> {
  data: T;
  serieKey: number;
  serieName: string;
}

export interface FlChartSerieWithColor {
  name: string;
  color: string;
}


export class FlChartSerie<Data extends FlChartData> implements FlChartDataContainer<Data>, FlLegend {

  private static key: number = 0;

  data: Data[];

  key: number;

  name: string;

  constructor(data: Data[], serieName: string) {
    this.data = data;
    this.key = FlChartSerie.key++;
    this.name = serieName;
  }

  public getDataWithSerie(getOnlyValid: boolean = false): FlChartDataWithSerie<Data>[] {
    const data: Data[] = getOnlyValid ? this.getValidData() : this.getData();

    return data.map(data => {
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

  /**
   * Retrieve only the valid data
   */
  public getValidData(): Data[] {
    return this.getData().filter(d => d.valid);
  }

  public addData(data: Data | Data[]): void {
    const dataArray = ClHelpService.convertObjectOrArrayToArray(data);
    this.data.push(...dataArray);
  }

  /**
   * Return all the tags value of the data grouped by key
   */
  public getTagsGroupByKey(): Record<string, string[]> {
    return FlTagHelper.groupTagsByKey(this.getAllTags());
  }

  public getAllTags(): Record<string, string>[] {
    const tags: Record<string, string>[] = [];

    for (const data of this.data) {
      if (data.tags && Object.keys(data.tags).length > 0) {
        tags.push(data.tags);
      }
    }
    return tags;
  }
}
