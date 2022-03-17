import {Component, Inject, OnInit} from '@angular/core';
import {FlSheetChart2dSerieSelectionForm} from '../../model/chart/fl-sheet-chart-selection-form.class';
import {FormBuilder, FormControl, FormGroup} from '@ngneat/reactive-forms';
import {ValidatorFn, Validators} from '@angular/forms';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FlSpreadsheetChartSelectionHelper,} from '../../utils/fl-spreadsheet-chart-selection.helper';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {
  FlSheetSelectionMode,
  FlSpreadsheetChartSerieSelectionInput
} from '../../model/chart/fl-sheet-chart-form-config.class';


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
              private overlayRef: FlOverlayRef,
              private state: FlSpreadsheetState) {
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
      y: [null,
        [
          Validators.required,
          this.getSelectionValidator(this.input.ySelectionMode)
        ]
      ],
    });

    if (this.input.mode === 'full') {
      this.formGp.addControl('x',
        new FormControl(null,
          [this.getSelectionValidator(this.input.xSelectionMode)]
        )
      );
    }
  }

  private getSelectionValidator(mode: FlSheetSelectionMode): ValidatorFn {
    return mode === 'single' ?
      FlSpreadsheetChartSelectionHelper.singleSelectionValidator(this.state.spreadsheet) :
      FlSpreadsheetChartSelectionHelper.multipleSelectionValidator(this.state.spreadsheet);
  }

  submit(): void {
    if (this.formGp.valid) {
      const value: FlSheetChart2dSerieSelectionForm = this.formGp.getRawValue();

      this.overlayRef.dispose(value);
    }
  }

}
