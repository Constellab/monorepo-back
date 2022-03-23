import {Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self} from '@angular/core';
import {FlFormFieldDirective} from '../../../../abstract-directive/form/fl-form-field.directive';
import {NgControl} from '@angular/forms';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {Observable, of, Subscription} from 'rxjs';
import {FlCellsMultipleRange} from '../../model/selection/fl-cells-multiple-range.class';
import {FlSheetSelectionRange} from '../../model/chart/fl-sheet-chart-selection-form.class';
import {FlSheetSingleSelection} from '../../model/selection/fl-sheet-single-selection.class';
import {FlSpreadsheetChartSelectionHelper} from '../../utils/fl-spreadsheet-chart-selection.helper';

interface FlSpreadsheetRangeForm {
  type: 'range' | 'columns';
  rangeSelection?: string;
  columnsSelection?: string[];
}


/**
 * Component for chart generation. It is a NgModel component to manage multiple range selection
 * It supports multiple mode :
 *  - Range selection
 *  - Columns selection
 */
@Component({
  selector: 'fl-sheet-ranges-input',
  templateUrl: './fl-sheet-ranges-input.component.html',
  styleUrls: ['./fl-sheet-ranges-input.component.scss'],
  providers: [{provide: FlFormFieldDirective, useExisting: FlSheetRangesInputComponent}]
})
export class FlSheetRangesInputComponent extends FlFormFieldDirective<FlSpreadsheetRangeForm, FlSheetSelectionRange>
  implements OnInit, OnDestroy {

  @Input() placeholder: string;

  @Input() initialSelection: FlSheetSingleSelection;

  @Input() selectionListenerGroup: string;

  @Input() rangeMode: 'single' | 'multi' = 'multi';

  @Output() selectionChange: EventEmitter<FlSheetSelectionRange> = new EventEmitter();


  formGp: FormGroup<FlSpreadsheetRangeForm>;

  columnSearchFunc: (searchString: string) => Observable<string[]>;

  private subscription: Subscription;

  constructor(@Optional() @Self() ngControl: NgControl,
              private state: FlSpreadsheetState) {
    super(ngControl);


  }

  ngOnInit(): void {
    this.initForm();


    this.columnSearchFunc = (searchString => of(this.state.currentSheet.searchColumns(searchString)));

    if (this.initialSelection) {
      this.onNewSelection(this.initialSelection);
    }

    // use a timeout to prevent change detection error
    setTimeout(() => {
      this.formGp.valueChanges.subscribe(
        value => this.setAndEmitValue(value)
      );
    }, 0);
  }

  private initForm(): void {
    const rangeValidation = this.rangeMode === 'multi' ?
      FlSpreadsheetChartSelectionHelper.multipleSelectionValidator(this.state.currentSheet) :
      FlSpreadsheetChartSelectionHelper.singleSelectionValidator(this.state.currentSheet);
    // init form Group here, because the writeValue can be called before ngOnInit
    this.formGp = new FormBuilder().group({
      type: ['range'],
      rangeSelection: [null, [rangeValidation]],
      columnsSelection: [null]
    });

    if (this.value != null) {
      this.formGp.patchValue(this.value);
    }
  }

  callChangeEvent(value: FlSheetSelectionRange): void {
    this.selectionChange.next(value);
  }

  onDisableChange(): void {
  }

  writeValue(obj: FlSheetSelectionRange): void {
    this.value = this.convertOuterToInner(obj);

    if (!obj) return;

    if (this.formGp) {
      this.formGp.patchValue(this.value);
    }
  }


  get mode(): 'range' | 'columns' {
    return this.formGp.value.type;
  }

  protected convertOuterToInner(outerValue: FlSheetSelectionRange): FlSpreadsheetRangeForm {
    if (!outerValue) return null;

    if (outerValue.type === 'range') {
      const multipleRange = FlCellsMultipleRange.fromCoords(outerValue.selection);
      return {
        type: 'range',
        rangeSelection: multipleRange.toString(),
        columnsSelection: null
      };
    } else {
      return {
        type: 'columns',
        columnsSelection: outerValue.selection,
        rangeSelection: null
      };
    }
  }

  protected convertInnerToOuter(innerValue: FlSpreadsheetRangeForm): FlSheetSelectionRange {
    if (!innerValue || this.formGp.invalid) return null;

    if (innerValue.type === 'range') {
      if (!innerValue.rangeSelection || this.formGp.get('rangeSelection').invalid) return null;
      const multipleRange = FlCellsMultipleRange.fromString(innerValue.rangeSelection);
      return {
        type: 'range',
        selection: multipleRange.toCoords()
      };
    } else {
      if (!innerValue.columnsSelection) return null;
      return {
        type: 'columns',
        selection: innerValue.columnsSelection
      };
    }
  }

  onNewSelection(selection: FlSheetSingleSelection): void {
    if (selection == null) return;

    this.writeValue(selection.toFlSheetSelectionRange());
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
