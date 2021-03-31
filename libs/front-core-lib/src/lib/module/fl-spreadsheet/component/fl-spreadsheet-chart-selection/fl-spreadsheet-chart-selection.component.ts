import {Component, Inject, OnInit} from '@angular/core';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {AbstractControl, ValidatorFn, Validators} from '@angular/forms';
import {FlCellCoord, FlSheetSelection, FlSheetSelectionFull} from '../../model/fl-sheet-selection.class';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {FlSpreadsheetHelper} from '../../utils/fl-spreadsheet.helper';
import {FlSheetMultiSelection} from '../../model/fl-sheet-multi-selection.class';
import {FlSheet} from '../../model/fl-sheet.class';
import {FlSheetChartSelection} from '../../model/fl-sheet-chart-selection.class';

interface FormObject {
  // dataSelection: string;
  seriesData: string;
  seriesName: string;
  xLabels: string;
}

/**
 * Modal component to select value from the excel to draw a chart
 */
@Component({
  selector: 'fl-spreadsheet-chart-selection',
  templateUrl: './fl-spreadsheet-chart-selection.component.html',
  styleUrls: ['./fl-spreadsheet-chart-selection.component.scss']
})
export class FlSpreadsheetChartSelectionComponent implements OnInit {

  formGp: FormGroup<FormObject>;

  constructor(private selectionState: FlSpreadsheetSelectionState,
              private state: FlSpreadsheetState,
              @Inject(FL_PORTAL_DATA) data: any,
              private overlayRef: FlOverlayRef) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.formGp = new FormBuilder().group({
      seriesData: [null, [
        Validators.required,
        this.multipleSelectionValidator(),
      ]],
      seriesName: [null, [
        Validators.required,
        this.singleSelectionValidator()
      ]],
      xLabels: [null, [
        Validators.required,
        this.singleSelectionValidator()
      ]],
    });

    // if there is a multiple selection
    const currentSelection: FlSheetSelection = this.selectionState.currentSelection;
    if (currentSelection && currentSelection.type !== 'single') {
      // init the form
      // this.formGp.get('dataSelection').patchValue(currentSelection.toString());
    }
  }

  submit(): void {
    if (this.formGp.valid) {
      const selection: FlSheetChartSelection = new FlSheetChartSelection(
        FlSheetMultiSelection.fromString(this.state.currentSheet, this.formGp.value.seriesData),
        FlSheetSelectionFull.FromString(this.state.currentSheet, this.formGp.value.seriesName),
        FlSheetSelectionFull.FromString(this.state.currentSheet, this.formGp.value.xLabels),
      );
      this.overlayRef.dispose(selection);
    }
  }

  /**
   * Validator to check single selection
   * Error invalidFormat if string format is invalid
   * Error selectionOutOfBound is selection is out of bound (pass the name of the coord problem)
   * @private
   */
  private singleSelectionValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }

      if (!FlSpreadsheetHelper.getRegexForSingleSelection().test(control.value)) {
        return {invalidFormat: true};
      }

      const sheet: FlSheet = this.state.currentSheet;

      const selection: FlSheetSelection = FlSheetSelectionFull.FromString(sheet, control.value);

      const outBoundCoord: FlCellCoord | null = sheet.checkRangeValidity(selection);
      if (outBoundCoord != null) {
        console.log(selection, outBoundCoord, FlSpreadsheetHelper.coordToString(outBoundCoord));
        return {selectionOutOfBound: FlSpreadsheetHelper.coordToString(outBoundCoord)};
      } else {
        return null;
      }
    };
  }


  /**
   * Validator to check multiple selection
   * Error invalidFormat if string format is invalid
   * Error selectionOutOfBound is selection is out of bound
   * @private
   */
  private multipleSelectionValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }

      if (!FlSpreadsheetHelper.getRegexForMultipleSelection().test(control.value)) {
        return {invalidFormat: true};
      }

      const sheet: FlSheet = this.state.currentSheet;

      const selections: FlSheetMultiSelection = FlSheetMultiSelection.fromString(sheet, control.value);

      for (const selection of selections.selections) {
        const outBoundCoord: FlCellCoord | null = sheet.checkRangeValidity(selection);
        if (outBoundCoord != null) {
          return {selectionOutOfBound: FlSpreadsheetHelper.coordToString(outBoundCoord)};
        }
      }

      return null;

    };
  }

}
