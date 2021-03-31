import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ThemePalette} from '@angular/material/core/common-behaviors/color';
import {Subscription} from 'rxjs';
import {AbstractControl} from '@angular/forms';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {FlSheetSelection} from '../../model/fl-sheet-selection.class';
import {FlSheetMultiSelection} from '../../model/fl-sheet-multi-selection.class';

/**
 * Component to link with input to listen to selection and fill input
 */
@Component({
  selector: 'fl-spreadsheet-selection-input',
  templateUrl: './fl-spreadsheet-selection-input.component.html',
  styleUrls: ['./fl-spreadsheet-selection-input.component.scss']
})
export class FlSpreadsheetSelectionInputComponent implements OnInit, OnDestroy {

  @Input() inputFormControl: AbstractControl;

  /**
   * Mode for the selection
   * Normal, it generate a string based on current selection
   * SplitRows, split the selection by rows separated with ,
   */
  @Input() mode: 'normal' | 'splitRows' = 'normal';

  selected: boolean = false;

  subscription: Subscription;

  constructor(private selectionState: FlSpreadsheetSelectionState) {
  }

  ngOnInit(): void {
  }

  get color(): ThemePalette | null {
    return this.selected ? 'primary' : null;
  }

  toggleSelected(): void {
    this.selected = !this.selected;

    if (this.selected) {
      this.subscription = this.selectionState.getSelection().subscribe(
        selection => this.onNewSelection(selection)
      );
    } else {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  private onNewSelection(selection: FlSheetSelection): void {
    if (selection) {
      this.inputFormControl.patchValue(this.convertSelectionToString(selection));
    } else {
      this.inputFormControl.patchValue(null);
    }
  }

  private convertSelectionToString(selection: FlSheetSelection): string {
    if (this.mode === 'normal') {
      return selection.toString();
    } else {
      // convert to multiple selection, one for each row
      const selections: FlSheetMultiSelection = new FlSheetMultiSelection(selection.splitToRowSelections());
      return selections.toString();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
