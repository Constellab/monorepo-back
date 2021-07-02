import {Component, Input, OnDestroy, OnInit, Optional} from '@angular/core';
import {ThemePalette} from '@angular/material/core/common-behaviors/color';
import {Subscription} from 'rxjs';
import {AbstractControl} from '@angular/forms';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {FlSheetSingleSelection} from '../../model/selection/fl-sheet-single-selection.class';
import {FlSheetMultiSelection} from '../../model/selection/fl-sheet-multi-selection.class';
import {FlSpreadsheetSelectionInputGroupDirective} from '../../directive/fl-spreadsheet-selection-input-group.directive';
import {filter} from 'rxjs/operators';

/**
 * Component to place in a input to listen to selection and fill input
 */
@Component({
  selector: 'fl-spreadsheet-selection-input',
  templateUrl: './fl-spreadsheet-selection-input.component.html',
  styleUrls: ['./fl-spreadsheet-selection-input.component.scss']
})
export class FlSpreadsheetSelectionInputComponent implements OnInit, OnDestroy {

  private static id: number = 0;

  @Input() inputFormControl: AbstractControl;

  /**
   * Mode for the selection
   * Normal, it generate a string based on current selection
   * SplitRows, split the selection by rows separated with ,
   */
  @Input() mode: 'normal' | 'splitRows' = 'normal';

  selected: boolean = false;

  private subscription: Subscription;
  private groupSubscription: Subscription;

  private readonly id: number;

  constructor(private selectionState: FlSpreadsheetSelectionState,
              @Optional() private group: FlSpreadsheetSelectionInputGroupDirective) {
    this.id = FlSpreadsheetSelectionInputComponent.id++;
  }

  ngOnInit(): void {
    if (this.group) {
      this.subscribeToGroup();
    }
  }

  private subscribeToGroup(): void {
    this.group.subscribeToSelection().pipe(
      // ignore the emission of this component instance
      // ignore if this component is not selected
      filter(id => this.id !== id && this.selected)
    ).subscribe(
      () => this.disableSelection()
    );
  }

  get color(): ThemePalette | null {
    return this.selected ? 'primary' : null;
  }

  toggleSelected(): void {
    if (!this.selected) {
      this.enableSelection();
    } else {
      this.disableSelection();
    }
  }


  private disableSelection(): void {
    this.selected = false;
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  private enableSelection(): void {
    this.selected = true;
    this.subscription = this.selectionState.getSelection$().subscribe(
      selection => this.onNewSelection(selection)
    );

    // if the group exists, warn it that this selection is selected
    if (this.group) {
      this.group.emitSelection(this.id);
    }
  }

  private onNewSelection(selection: FlSheetSingleSelection): void {
    if (selection) {
      this.inputFormControl.patchValue(this.convertSelectionToString(selection));
    } else {
      this.inputFormControl.patchValue(null);
    }
  }

  private convertSelectionToString(selection: FlSheetSingleSelection): string {
    if (this.mode === 'normal') {
      return selection.toString();
    } else {
      // convert to multiple selection, one for each row
      const selections: FlSheetMultiSelection = new FlSheetMultiSelection(selection.splitToColumnSelections());
      return selections.toString();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.groupSubscription?.unsubscribe();
  }


}
