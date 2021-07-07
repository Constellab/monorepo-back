import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlSheetChart2dSerieSelectionForm, FlSheetChartSelectionForm} from '../model/chart/fl-sheet-chart-selection-form.class';
import {FlChartType} from '../../fl-chart/model/fl-chart.class';
import {FlSheetMultiSelection} from '../model/selection/fl-sheet-multi-selection.class';
import {FlSheet} from '../model/fl-sheet.class';
import {FlSheetChartSelectionBasic} from '../model/chart/fl-sheet-chart-selection-basic.class';
import {FlSheetChartSelection} from '../model/chart/fl-sheet-chart-selection.class';
import {FlSheetChartSelectionHistogram} from '../model/chart/fl-sheet-chart-selection-histogram.class';
import {FlSheetChartSelectionBoxPlot} from '../model/chart/fl-sheet-chart-selection-box-plot.class';
import {FlSheetChartSelectionBarPlot} from '../model/chart/fl-sheet-chart-selection-bar-plot.class';
import {FlSheetChartSelectionHeatMap} from '../model/chart/fl-sheet-chart-selection-heat-map.class';
import {AbstractControl, ValidatorFn} from '@angular/forms';
import {FlSpreadsheetHelper} from './fl-spreadsheet.helper';
import {FlSheetSingleSelection, FlSheetSingleSelectionFull} from '../model/selection/fl-sheet-single-selection.class';
import {FlSpreadsheet} from '../model/fl-spreadsheet.class';
import {FlSheetSelection} from '../model/selection/fl-sheet-selection.class';


/**
 * Mode for the selection
 * Single, it generate a string based on current single selection (like A1:C3)
 * Multi, it generate a multi selection separated with ',' (like A1:B3,D1:D4)
 */
export type FlSheetSelectionMode = 'single' | 'multi'

// on onlyY mode, there is no input to select X abscisse data
export type FlSpreadsheetSelectSerieMode = 'full' | 'onlyY';


export interface FlSpreadsheetChartSerieSelectionInput {
  mode: FlSpreadsheetSelectSerieMode;
  serie: FlSheetChart2dSerieSelectionForm;
  ySelectionMode: FlSheetSelectionMode;
  xSelectionMode?: FlSheetSelectionMode;
}

/**
 * Class linked to {@link FlSpreadsheetChartSelectionComponent} to help handle different
 * chart types
 */
export class FlSpreadsheetChartSelectionFactory {

  /**
   * Create the series based on chart type and data selection
   */
  public static createSerieFromDataRange(chartType: FlChartType, dataSelection: FlSheetMultiSelection,
                                         serieNames: string[]): FlSheetChart2dSerieSelectionForm[] {
    let series: FlSheetChart2dSerieSelectionForm[];

    switch (chartType) {
      case FlChartType.SCATTER_PLOT:
        series = FlSpreadsheetChartSelectionFactory.createMultipleSeriesForXAndY(dataSelection);
        break;
      case FlChartType.LINE:
      case FlChartType.BAR_PLOT:
      case FlChartType.BOX_PLOT:
        series = FlSpreadsheetChartSelectionFactory.createMultiplesSeriesForY(dataSelection);
        break;
      case FlChartType.HISTOGRAM:
        series = FlSpreadsheetChartSelectionFactory.createSingleSerieForY(dataSelection);
        break;
      case FlChartType.HEAT_MAP:
        // create a single selection only from the first selection
        series = FlSpreadsheetChartSelectionFactory.createSingleSerieForY(dataSelection.selections[0]);
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
    const selections: FlSheetSingleSelection[] = dataSelection.splitToColumnSelections();
    if (selections.length > 1) {
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
  private static createSingleSerieForY(dataSelection: FlSheetSelection): FlSheetChart2dSerieSelectionForm[] {
    return [{y: dataSelection.toString()}];
  }

  // create one serie for each column selection only for Y
  private static createMultiplesSeriesForY(dataSelection: FlSheetMultiSelection): FlSheetChart2dSerieSelectionForm[] {
    const selections: FlSheetSingleSelection[] = dataSelection.splitToColumnSelections();

    return selections.map(selection => {
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
      case FlChartType.SCATTER_PLOT:
      case FlChartType.LINE:
        return new FlSheetChartSelectionBasic(sheet, formValue);
      case FlChartType.HISTOGRAM:
        return new FlSheetChartSelectionHistogram(sheet, formValue);
      case FlChartType.BOX_PLOT:
        return new FlSheetChartSelectionBoxPlot(sheet, formValue);
      case FlChartType.BAR_PLOT:
        return new FlSheetChartSelectionBarPlot(sheet, formValue);
      case FlChartType.HEAT_MAP:
        return new FlSheetChartSelectionHeatMap(sheet, formValue);
    }
  }

  /**
   * Function to return the select config for {@link FlSpreadsheetChartSerieSelectionComponent}
   * based on chart Type (on which chart can we select x values? )
   */
  public static getSelectSerieConfig(chartType: FlChartType, serie: FlSheetChart2dSerieSelectionForm):
    FlSpreadsheetChartSerieSelectionInput {
    switch (chartType) {
      // charts where the x values can be selected
      case FlChartType.SCATTER_PLOT:
      case FlChartType.LINE:
        return {
          serie: serie,
          mode: 'full',
          ySelectionMode: 'multi',
          xSelectionMode: 'multi'
        };
      // charts where only the y values can be selected
      case FlChartType.HISTOGRAM:
      case FlChartType.BOX_PLOT:
      case FlChartType.BAR_PLOT:
        return {
          serie: serie,
          mode: 'onlyY',
          ySelectionMode: 'multi',
        };
        // in heat we only allow single selection to have a clean 2d array
      case FlChartType.HEAT_MAP:
        return {
          serie: serie,
          mode: 'onlyY',
          ySelectionMode: 'single',
        };
    }
  }

  /**
   * Return the nb max of series that can be selected based on the chart type
   * @param chartType
   */
  public static getNbMaxOfSeries(chartType: FlChartType): number {
    switch (chartType) {
      case FlChartType.HISTOGRAM:
      case FlChartType.HEAT_MAP:
        return 1;
      default:
        return Infinity;
    }
  }

  /**
   * Validator to check single selection
   * Error invalidFormat if string format is invalid
   * Error selectionOutOfBound is selection is out of bound (pass the name of the coord problem)
   * @private
   */
  public static singleSelectionValidator(spreadSheet: FlSpreadsheet): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }

      if (!FlSpreadsheetHelper.getRegexForSingleSelection().test(control.value)) {
        return {invalidFormat: true};
      }

      const sheet: FlSheet = spreadSheet.currentSheet;
      const selection: FlSheetSingleSelection = FlSheetSingleSelectionFull.fromString(sheet, control.value);

      if (!sheet.coordIsValid(selection.from)) {
        return {selectionOutOfBound: FlSpreadsheetHelper.coordToString(selection.from)};
      }

      if (!sheet.coordIsValid(selection.to)) {
        return {selectionOutOfBound: FlSpreadsheetHelper.coordToString(selection.to)};
      }

      return null;

    };
  }


  /**
   * Validator to check multiple selection
   * Error invalidFormat if string format is invalid
   * Error selectionOutOfBound is selection is out of bound
   * @private
   */
  public static multipleSelectionValidator(spreadSheet: FlSpreadsheet): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }

      if (!FlSpreadsheetHelper.getRegexForMultipleSelection().test(control.value)) {
        return {invalidFormat: true};
      }

      const sheet: FlSheet = spreadSheet.currentSheet;
      const selections: FlSheetMultiSelection = FlSheetMultiSelection.fromString(sheet, control.value);

      for (const selection of selections.selections) {
        if (!sheet.coordIsValid(selection.from)) {
          return {selectionOutOfBound: FlSpreadsheetHelper.coordToString(selection.from)};
        }

        if (!sheet.coordIsValid(selection.to)) {
          return {selectionOutOfBound: FlSpreadsheetHelper.coordToString(selection.to)};
        }
      }

      return null;
    };
  }

  public static getSelectionValidator(mode: FlSheetSelectionMode, spreadsheet: FlSpreadsheet): ValidatorFn {
    return mode === 'single' ?
      FlSpreadsheetChartSelectionFactory.singleSelectionValidator(spreadsheet) :
      FlSpreadsheetChartSelectionFactory.multipleSelectionValidator(spreadsheet);
  }
}
