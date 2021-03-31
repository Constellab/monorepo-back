import {FlSheetMultiSelection} from './fl-sheet-multi-selection.class';
import {FlSheetSelection} from './fl-sheet-selection.class';
import {FlChart2dDatum, FlChart2dMultipleSerie, FlChart2dSerie} from '../../fl-chart/model/fl-chart-2d-data.class';
import {FlCell} from './fl-cell.class';
import {Numeric} from 'd3';

export class FlSheetChartSelection {
  series: FlSheetMultiSelection;
  xLabels: FlSheetSelection;

  constructor(series: FlSheetMultiSelection, xLabels: FlSheetSelection) {
    this.series = series;
    this.xLabels = xLabels;
  }

  public exportToSeries(): FlChart2dMultipleSerie<any> {
    const series: FlChart2dMultipleSerie<any> = new FlChart2dMultipleSerie();

    const seriesSelections: FlSheetSelection[] = this.series.selections;
    for (let i = 0; i < seriesSelections.length; i++) {
      series.addSerie(new FlChart2dSerie<any>(
        this.getSerieData(seriesSelections[i]),
        this.getXLabelAtIndex(i)));
    }

    return series;
  }

  private getSerieData(selection: FlSheetSelection): FlChart2dDatum[] {
    const values: any[] = selection.getSelectedCellsValuesFlat();

    // create a chart datum for each values
    // take index as x and cell value as Y if it's a number (0 otherwise)
    // todo check if we et 0 in case of NAN
    return values.map((value, index) => new FlSheetChartDatum(index, isNaN(value) ? 0 : value));
  }

  private getXLabelAtIndex(index: number): string {
    const cells: FlCell[] = this.xLabels.getSelectedCellsFlat();

    // if there is not more label, return the index as x label
    if (index >= cells.length) {
      return index.toString();
    }

    return cells[index].value.toString();
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
