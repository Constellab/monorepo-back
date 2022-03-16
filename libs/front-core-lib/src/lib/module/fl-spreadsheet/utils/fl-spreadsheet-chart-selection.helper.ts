import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlSheetChart2dSerieSelectionForm} from '../model/chart/fl-sheet-chart-selection-form.class';
import {FlSheetMultiSelection} from '../model/selection/fl-sheet-multi-selection.class';
import {FlSheet} from '../model/fl-sheet.class';
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

// define how to split the data selection
export type FlSpreadsheetSplitSelectionMode = 'row' | 'column';


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
export class FlSpreadsheetChartSelectionHelper {

  // if there is multiple selections, take the first one as X selections
  public static createMultipleSeriesForXAndY(dataSelection: FlSheetMultiSelection, splitSelection: FlSpreadsheetSplitSelectionMode):
    FlSheetChart2dSerieSelectionForm[] {
    const selections: FlSheetSingleSelection[] = FlSpreadsheetChartSelectionHelper.splitSelection(dataSelection, splitSelection);
    if (selections.length > 1) {
      const x: string = selections.shift().toString();

      return selections.map((selection, index) => {
        return {x: x, y: selection.toString(), name: FlSpreadsheetChartSelectionHelper.getDefaultSerieName(index)};
      });

    } else {
      // if there is only one column selected, use it a an serie with Y
      return FlSpreadsheetChartSelectionHelper.createMultiplesSeriesForY(dataSelection, splitSelection);
    }
  }

  // create a single serie for Y containing all the data
  public static createSingleSerieForY(dataSelection: FlSheetSelection): FlSheetChart2dSerieSelectionForm[] {
    return [{y: dataSelection.toString(), name: FlSpreadsheetChartSelectionHelper.getDefaultSerieName(0)}];
  }

  // create one serie for each column selection only for Y
  public static createMultiplesSeriesForY(dataSelection: FlSheetMultiSelection,
                                          splitSelection: FlSpreadsheetSplitSelectionMode): FlSheetChart2dSerieSelectionForm[] {
    const selections: FlSheetSingleSelection[] = FlSpreadsheetChartSelectionHelper.splitSelection(dataSelection, splitSelection);

    return selections.map((selection, index) => (
      {
        y: selection.toString(),
        name: FlSpreadsheetChartSelectionHelper.getDefaultSerieName(index)
      }
    ));
  }

  private static splitSelection(dataSelection: FlSheetMultiSelection,
                                splitSelection: FlSpreadsheetSplitSelectionMode): FlSheetSingleSelection[] {
    if (splitSelection === 'row') {
      return dataSelection.splitToRowSelections();
    } else {
      return dataSelection.splitToColumnSelections();
    }
  }


  public static getDefaultSerieName(index: number): string {
    return FlTranslateService.getInstance().translate('flSpreadsheet.chart_serie') + ' ' + (index + 1);
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
      FlSpreadsheetChartSelectionHelper.singleSelectionValidator(spreadsheet) :
      FlSpreadsheetChartSelectionHelper.multipleSelectionValidator(spreadsheet);
  }
}
