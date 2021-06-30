import {FlSheetMultiSelection} from './fl-sheet-multi-selection.class';
import {FlSheetSelection} from './fl-sheet-selection.class';
import {FlChart2dDatum, FlChartAxisTickFormat} from '../../fl-chart/model/fl-chart-2d-data.class';
import {FlCell} from './fl-cell.class';
import {Numeric} from 'd3';
import {FlChart2dSerie} from '../../fl-chart/model/fl-chart-2d-serie.class';
import {FlChartComponentType} from '../../fl-chart/model/fl-chart-component.class';
import {FlChartDomain, FlChartDomainComplete, FlChartDomainLinear} from '../../fl-chart/model/fl-chart-domain.class';
import {ClNumberHelper} from '@monorepo/core-lib';
import {FlChart2dMultiSerie} from '../../fl-chart/model/fl-chart-2d-multi-serie.class';

/**
 * Class to store a selection for a basic chart
 */
export class FlSheetChartSelection {


  constructor(public chartType: FlChartComponentType,
              public seriesData: FlSheetMultiSelection,
              public seriesLabels: FlSheetSelection | null,
              public xLabels: FlSheetSelection | null) {

  }

  public exportToSeries(): FlChart2dMultiSerie<any> {
    const domainX: FlChartDomain = this.getDomainX();
    const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie(domainX);

    const seriesSelections: FlSheetSelection[] = this.seriesData.selections;
    for (let i = 0; i < seriesSelections.length; i++) {
      series.addSerie(new FlChart2dSerie<any>(
        this.getSerieData(seriesSelections[i]),
        domainX,
        this.getSerieNameAtIndex(i)));
    }

    series.axisXLabelFormat = this.getXAxisFormat();

    console.log(series);
    return series;
  }

  private getSerieData(selection: FlSheetSelection): FlChart2dDatum[] {
    const values: any[] = selection.getSelectedCellsValuesFlat();

    // create a chart datum for each values
    // take index as x and cell value as Y if it's a number (0 otherwise)
    return values.map((value, index) => new FlSheetChartDatum(index, ClNumberHelper.fromString(value)))
      .filter(value => value.getY() != null); // exclude null values
  }

  // retrieve the serie name from the series labels selection at a specific index
  private getSerieNameAtIndex(index: number): string {
    if (this.seriesLabels == null) {
      return index.toString();
    }

    const cells: FlCell[] = this.seriesLabels.getSelectedCellsFlat();

    // if there is not more label, return the index as x label
    if (index >= cells.length) {
      return index.toString();
    }

    return cells[index].value.toString();
  }

  /**
   * return the method to format the x labels
   */
  private getXAxisFormat(): FlChartAxisTickFormat | null {
    if (this.xLabels == null) {
      // show only the integer x
      return ((x: number) => Number.isInteger(x) ? x.toString() : '');
    }

    const values: any = this.xLabels.getSelectedCellsValuesFlat();
    // return a string only for integer
    return ((x: number) => Number.isInteger(x) ? values[(x)]?.toString() ?? x : '');
  }

  /**
   * Get the object to get the X domain
   * @private
   */
  private getDomainX(): FlChartDomain {
    switch (this.chartType) {
      case FlChartComponentType.BAR_PLOT:
        return new FlChartDomainComplete();
      case FlChartComponentType.SCATTER_PLOT:
        return new FlChartDomainLinear(0.5);
      default:
        return new FlChartDomainLinear();
    }
  }

}

export class FlSheetChartDatum implements FlChart2dDatum {

  constructor(private x: number, private y: number) {
  }

  getX(): Numeric {
    return this.x;
  }

  getY(): Numeric {
    return this.y;
  }
}
