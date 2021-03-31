import {FlSheetMultiSelection} from './fl-sheet-multi-selection.class';
import {FlSheetSelection} from './fl-sheet-selection.class';
import {FlChart2dDatum, FlChartAxisTickFormat} from '../../fl-chart/model/fl-chart-2d-data.class';
import {FlCell} from './fl-cell.class';
import {Numeric} from 'd3';
import {FlChart2dMultipleSerie, FlChart2dSerie} from '../../fl-chart/model/fl-chart-2d-serie.class';

/**
 * Class to store a selection for a basic chart
 */
export class FlSheetChartSelection {
  seriesData: FlSheetMultiSelection;
  seriesLabels: FlSheetSelection | null;
  xLabels: FlSheetSelection;

  constructor(series: FlSheetMultiSelection, seriesLabels: FlSheetSelection | null,
              xLabels: FlSheetSelection | null) {
    this.seriesData = series;
    this.seriesLabels = seriesLabels;
    this.xLabels = xLabels;
  }

  public exportToSeries(): FlChart2dMultipleSerie<any> {
    const series: FlChart2dMultipleSerie<any> = new FlChart2dMultipleSerie();

    const seriesSelections: FlSheetSelection[] = this.seriesData.selections;
    for (let i = 0; i < seriesSelections.length; i++) {
      series.addSerie(new FlChart2dSerie<any>(
        this.getSerieData(seriesSelections[i]),
        this.getSerieNameAtIndex(i)));
    }

    series.setXAxisFormat(this.getXAxisFormat());

    return series;
  }

  private getSerieData(selection: FlSheetSelection): FlChart2dDatum[] {
    const values: any[] = selection.getSelectedCellsValuesFlat();

    // create a chart datum for each values
    // take index as x and cell value as Y if it's a number (0 otherwise)
    // todo check if we et 0 in case of NAN
    return values.map((value, index) => new FlSheetChartDatum(index, isNaN(value) ? 0 : value));
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
    return ((x: number) => Number.isInteger(x) ? values[x].toString() ?? '' : '');
  }

}

export class FlSheetChartDatum implements FlChart2dDatum {

  constructor(private x: number, private y: number) {
  }


  getX(): Numeric {
    return this.x;
  }

  getXLabel(): string {
    return '';
  }

  getY(): Numeric {
    return this.y;
  }

  getYLabel(): string {
    return '';
  }

}
