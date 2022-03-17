import {Component, EventEmitter, OnDestroy, OnInit, Optional, Output} from '@angular/core';
import {ThemePalette} from '@angular/material/core/common-behaviors/color';
import {Subscription} from 'rxjs';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {FlSheetSingleSelection} from '../../model/selection/fl-sheet-single-selection.class';
import {
  FlSpreadsheetSelectionInputGroupDirective
} from '../../directive/fl-spreadsheet-selection-input-group.directive';
import {filter} from 'rxjs/operators';

/**
 * Component to listen to selection on spreadsheet
 */
@Component({
  selector: 'fl-spreadsheet-selection-listener',
  templateUrl: './fl-spreadsheet-selection-listener.component.html',
  styleUrls: ['./fl-spreadsheet-selection-listener.component.scss']
})
export class FlSpreadsheetSelectionListenerComponent implements OnInit, OnDestroy {


  @Output() selectionChange: EventEmitter<FlSheetSingleSelection> = new EventEmitter();


  selected: boolean = false;

  private subscription: Subscription;
  private groupSubscription: Subscription;

  private readonly id: symbol;

  constructor(private selectionState: FlSpreadsheetSelectionState,
              @Optional() private group: FlSpreadsheetSelectionInputGroupDirective) {
    this.id = Symbol();
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
    this.selectionChange.next(selection);
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.groupSubscription?.unsubscribe();
  }


}
