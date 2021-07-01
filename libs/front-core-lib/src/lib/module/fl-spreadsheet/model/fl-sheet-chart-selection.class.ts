import {FlSheetMultiSelection} from './fl-sheet-multi-selection.class';
import {FlSheetSelection} from './fl-sheet-selection.class';
import {FlChart2dDatum, FlChart2dDatumNumber, FlChartAxisTickFormat} from '../../fl-chart/model/data/fl-chart-data.class';
import {FlCell} from './fl-cell.class';
import {FlChartSerie} from '../../fl-chart/model/data/fl-chart-serie.class';
import {FlChartComponentType} from '../../fl-chart/model/fl-chart-component.class';
import {ClNumberHelper} from '@monorepo/core-lib';
import {FlChart2dMultiSerie, FlChartMultiSerie} from '../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlChartDataBin, flChartGetDataBins} from '../../fl-chart/model/data/fl-chart-data-bin.class';
import {FlChartBoxPlotSerie, flChartGetBoxPlotData} from '../../fl-chart/model/data/fl-chart-box-plot-data.class';

/**
 * Class to store a selection for a basic chart
 */
export class FlSheetChartSelection {


  constructor(public chartType: FlChartComponentType,
              public seriesData: FlSheetMultiSelection,
              public seriesLabels: FlSheetSelection | null,
              public xLabels: FlSheetSelection | null) {

  }

  public exportToSeries(): FlChartMultiSerie<any> {
    // todo check if this is the right place
    if (this.chartType === FlChartComponentType.HISTOGRAM) {
      const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
      // convert all the data to numbers
      const data: number[] = this.seriesData.getCellsValuesFlat().map(
        cellValue => ClNumberHelper.fromString(cellValue))
        .filter(value => value != null);

      // create the serie with bin data
      const serie: FlChartSerie<any> = new FlChartSerie<any>(flChartGetDataBins(data), this.getSerieNameAtIndex(0));

      // define the axisXLabelFormat
      series.axisXLabelFormat = (index: number) => {
        const dataHisto: FlChartDataBin = serie.data[index];
        return dataHisto.getIntervalText();
      };
      series.addSerie(serie);
      return series;


    } else if (this.chartType === FlChartComponentType.BOX_PLOT) {
      const series: FlChartMultiSerie<any> = new FlChartMultiSerie();
      const seriesSelections: FlSheetSelection[] = this.seriesData.selections;

      for (let i = 0; i < seriesSelections.length; i++) {
        const values: number[] = this.getSelectionValues(seriesSelections[i]);

        series.addSerie(new FlChartBoxPlotSerie(flChartGetBoxPlotData(values), this.getSerieNameAtIndex(i)));
      }
      return series;

    } else {
      const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
      const seriesSelections: FlSheetSelection[] = this.seriesData.selections;
      for (let i = 0; i < seriesSelections.length; i++) {
        series.addSerie(new FlChartSerie<any>(
          this.convertSelectionTo2dDatum(seriesSelections[i]),
          this.getSerieNameAtIndex(i)));
      }

      series.axisXLabelFormat = this.getXAxisFormat();
      return series;
    }

  }

  /**
   * Convert the selections values to 2d datum with x = index of the value and y = value as number
   * @param selection
   * @private
   */
  private convertSelectionTo2dDatum(selection: FlSheetSelection): FlChart2dDatum[] {
    // create a chart datum for each values
    return this.getSelectionValues(selection).map((value, index) => new FlChart2dDatumNumber(index, value));
  }

  // return the selection values as numbers, it exclude the value that are not numbers
  private getSelectionValues(selection: FlSheetSelection): number[] {
    const values: any[] = selection.getCellsValuesFlat();

    // convert the values to number if possible
    return values.map(value => ClNumberHelper.fromString(value))
      .filter(value => value != null); // exclude null values
  }

  // retrieve the serie name from the series labels selection at a specific index
  private getSerieNameAtIndex(index: number): string {
    if (this.seriesLabels == null) {
      return index.toString();
    }

    const cells: FlCell[] = this.seriesLabels.getCellsFlat();

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

    const values: any = this.xLabels.getCellsValuesFlat();
    // return a string only for integer
    return ((x: number) => Number.isInteger(x) ? values[(x)]?.toString() ?? x : '');
  }

}
