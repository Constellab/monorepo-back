import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlSheetChart2dSerieSelectionForm, FlSheetChartSelectionForm} from '../model/chart/fl-sheet-chart-selection-form.class';
import {FlChartComponentType} from '../../fl-chart/model/fl-chart-component.class';
import {FlSheetMultiSelection} from '../model/selection/fl-sheet-multi-selection.class';
import {FlSheet} from '../model/fl-sheet.class';
import {FlSheetChartSelectionBasic} from '../model/chart/fl-sheet-chart-selection-basic.class';
import {FlSheetChartSelection} from '../model/chart/fl-sheet-chart-selection.class';
import {FlSheetChartSelectionHistogram} from '../model/chart/fl-sheet-chart-selection-histogram.class';
import {FlSheetChartSelectionBoxPlot} from '../model/chart/fl-sheet-chart-selection-box-plot.class';
import {FlSheetChartSelectionBarPlot} from '../model/chart/fl-sheet-chart-selection-bar-plot.class';
import {FlSpreadsheetSelectSerieMode} from '../component/fl-spreadsheet-chart-serie-selection/fl-spreadsheet-chart-serie-selection.component';

/**
 * Class linked to {@link FlSpreadsheetChartSelectionComponent} to help handle different
 * chart types
 */
export class FlSpreadsheetChartSelectionFactory {

  /**
   * Create the series based on chart type and data selection
   */
  public static createSerieFromDataRange(chartType: FlChartComponentType, dataSelection: FlSheetMultiSelection,
                                         serieNames: string[]): FlSheetChart2dSerieSelectionForm[] {
    let series: FlSheetChart2dSerieSelectionForm[];

    switch (chartType) {
      case FlChartComponentType.SCATTER_PLOT:
      case FlChartComponentType.LINE:
        series = FlSpreadsheetChartSelectionFactory.createMultipleSeriesForXAndY(dataSelection);
        break;
      case FlChartComponentType.HISTOGRAM:
        series = FlSpreadsheetChartSelectionFactory.createSingleSerieForY(dataSelection);
        break;
      case FlChartComponentType.BAR_PLOT:
      case FlChartComponentType.BOX_PLOT:
        series = FlSpreadsheetChartSelectionFactory.createMultiplesSeriesForY(dataSelection);
        break;
    }

    // set the series' names
    for (let i = 0; i < series.length; i++) {
      series[i].name = FlSpreadsheetChartSelectionFactory.getSerieNameAtIndex(i, serieNames);
    }

    return series;
  }

  // if there is multiple selections, take the first one as X selections
  private static createMultipleSeriesForXAndY(dataSelection: FlSheetMultiSelection): FlSheetChart2dSerieSelectionForm[] {
    if (dataSelection.selections.length > 1) {
      const selections = [...dataSelection.selections];
      const x: string = selections.shift().toString();

      return selections.map(selection => {
        return {x: x, y: selection.toString()};
      });

    } else {
      // if there is only one column selected, use it a an serie with Y
      return FlSpreadsheetChartSelectionFactory.createMultiplesSeriesForY(dataSelection);
    }
  }

  // create a single serie for Y containing all the data
  private static createSingleSerieForY(dataSelection: FlSheetMultiSelection): FlSheetChart2dSerieSelectionForm[] {
    return [{y: dataSelection.toString()}];
  }

  // create one serie for each selection only for Y
  private static createMultiplesSeriesForY(dataSelection: FlSheetMultiSelection): FlSheetChart2dSerieSelectionForm[] {
    return dataSelection.selections.map(selection => {
      return {y: selection.toString()};
    });
  }


  public static getSerieNameAtIndex(index: number, serieNames: string[]): string {
    if (serieNames && serieNames[index]) {
      return serieNames[index];
    }

    return FlTranslateService.getInstance().translate('flSpreadsheet.chart_serie') + ' ' + (index + 1);
  }


  /**
   * Create the chart selection from the form value
   * @param formValue
   * @param sheet
   */
  public static convertFormGpValueToSelectionChart(formValue: FlSheetChartSelectionForm, sheet: FlSheet)
    : FlSheetChartSelection {
    switch (formValue.chartType) {
      case FlChartComponentType.SCATTER_PLOT:
      case FlChartComponentType.LINE:
        return new FlSheetChartSelectionBasic(sheet, formValue.chartType, formValue.dataRange, formValue.seriesNameRange,
          formValue.series);
      case FlChartComponentType.HISTOGRAM:
        return new FlSheetChartSelectionHistogram(sheet, formValue.chartType, formValue.dataRange, formValue.seriesNameRange,
          formValue.series[0], formValue.nbOfBins);
      case FlChartComponentType.BOX_PLOT:
        return new FlSheetChartSelectionBoxPlot(sheet, formValue.chartType, formValue.dataRange, formValue.seriesNameRange,
          formValue.series);
      case FlChartComponentType.BAR_PLOT:
        return new FlSheetChartSelectionBarPlot(sheet, formValue.chartType, formValue.dataRange, formValue.seriesNameRange,
          formValue.series);
    }
  }

  /**
   * Function to return the select mode for {@link FlSpreadsheetChartSerieSelectionComponent}
   * based on chart Type (on which chart can we select x values? )
   * @param chartType
   */
  public static getSelectSerieMode(chartType: FlChartComponentType): FlSpreadsheetSelectSerieMode {
    switch (chartType) {
      // charts where the x values can be selected
      case FlChartComponentType.SCATTER_PLOT:
      case FlChartComponentType.LINE:
        return 'full';
      // charts where only the y values can be selected
      case FlChartComponentType.HISTOGRAM:
      case FlChartComponentType.BOX_PLOT:
      case FlChartComponentType.BAR_PLOT:
        return 'onlyY';
    }
  }
}
