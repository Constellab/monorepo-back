import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlSheetMultiSelection} from '../model/selection/fl-sheet-multi-selection.class';
import {FlSheet} from '../model/fl-sheet.class';
import {AbstractControl, ValidatorFn} from '@angular/forms';
import {FlSpreadsheetHelper} from './fl-spreadsheet.helper';
import {FlSheetSingleSelection, FlSheetSingleSelectionFull} from '../model/selection/fl-sheet-single-selection.class';
import {FlSpreadsheet} from '../model/fl-spreadsheet.class';

/**
 * Class linked to {@link FlSpreadsheetChartSelectionComponent} to help handle different
 * chart types
 */
export class FlSpreadsheetChartSelectionHelper {


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
}
