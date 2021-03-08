import {ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet-state.service';
import {Subscription} from 'rxjs';
import {FlSheetSelectionChange, FlSheetSelectionRange} from '../../model/fl-sheet-selection-change.class';

@Component({
  selector: 'fl-spreadsheet-header-cell',
  templateUrl: './fl-spreadsheet-header-cell.component.html',
  styleUrls: ['./fl-spreadsheet-header-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetHeaderCellComponent implements OnInit, OnDestroy {

  @Input() index: number;

  // if the header cell is a row or a column
  @Input() type: 'row' | 'column';

  subscription: Subscription;

  constructor(private state: FlSpreadsheetState,
              private renderer: Renderer2,
              private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.renderer.addClass(this.elementRef.nativeElement, this.type);
    this.subscribeToSelection();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // left click
    if (event.button === 0) {
      this.state.startSelection();
      if (this.type === 'row') {
        this.state.selectUniqueRow(this.index);
      } else {
        this.state.selectUniqueColumn(this.index);
      }
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.type === 'row') {
      this.state.expandRowsSelection(this.index);
    } else {
      this.state.expandColumnsSelection(this.index);
    }
  }

  private subscribeToSelection(): void {
    this.subscription = this.state.getSelection().subscribe(
      selection => this.onSelectionChange(selection)
    );
  }

  private onSelectionChange(selection: FlSheetSelectionChange): void {
    if (selection == null) {
      this.renderer.removeClass(this.elementRef.nativeElement, this.getSelectedClass());
    } else {
      if (this.isSelected(selection)) {
        this.renderer.addClass(this.elementRef.nativeElement, this.getSelectedClass());
      } else {
        this.renderer.removeClass(this.elementRef.nativeElement, this.getSelectedClass());
      }
    }
  }

  // return true is the current row or column is selected based on a selection event
  private isSelected(selection: FlSheetSelectionChange): boolean {
    const range: FlSheetSelectionRange = selection.selectionRange();
    if (this.type === 'column') {
      return this.index >= range.from.column && this.index <= range.to.column;
    } else {
      return this.index >= range.from.row && this.index <= range.to.row;
    }
  }

  private getSelectedClass(): string {
    return this.type === 'column' ? 'column-selected' : 'row-selected';
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
