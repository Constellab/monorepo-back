import {Component, Inject, OnInit} from '@angular/core';
import {FlSheetChart2dSerieSelectionForm} from '../../model/chart/fl-sheet-chart-selection-form.class';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';

export type FlSpreadsheetSelectSerieMode = 'full' | 'onlyY'; // on onlyY mode, there is no input to select X abscisse data

export interface FlSpreadsheetChartSerieSelectionInput {
  mode: FlSpreadsheetSelectSerieMode;
  serie: FlSheetChart2dSerieSelectionForm;
}

/**
 * Portal to select one serie during chart selection
 */
@Component({
  selector: 'fl-spreadsheet-chart-serie-selection',
  templateUrl: './fl-spreadsheet-chart-serie-selection.component.html',
  styleUrls: ['./fl-spreadsheet-chart-serie-selection.component.scss']
})
export class FlSpreadsheetChartSerieSelectionComponent implements OnInit {

  formGp: FormGroup<FlSheetChart2dSerieSelectionForm>;

  input: FlSpreadsheetChartSerieSelectionInput;

  constructor(@Inject(FL_PORTAL_DATA) input: FlSpreadsheetChartSerieSelectionInput,
              private overlayRef: FlOverlayRef) {
    this.input = input;
  }

  ngOnInit(): void {
    this.initForm();

    if (this.input.serie != null) {
      this.formGp.patchValue(this.input.serie);
    }
  }

  private initForm(): void {
    this.formGp = new FormBuilder().group({
      name: [null, Validators.required],
      y: [null, Validators.required],
    });

    if (this.input.mode === 'full') {
      this.formGp.addControl('x', new FormControl(null));
    }
  }

  submit(): void {
    if (this.formGp.valid) {
      const value: FlSheetChart2dSerieSelectionForm = this.formGp.getRawValue();

      this.overlayRef.dispose(value);
    }
  }
}
