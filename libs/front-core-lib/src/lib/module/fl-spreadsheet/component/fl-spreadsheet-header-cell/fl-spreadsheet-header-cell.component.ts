import {ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {Subscription} from 'rxjs';
import {FlHeaderCellType, FlSheetSelection} from '../../model/fl-sheet-selection.class';
import {headerIndexAttributeName, headerTypeAttributeName} from '../../model/fl-cell.class';

@Component({
  selector: 'fl-spreadsheet-header-cell',
  templateUrl: './fl-spreadsheet-header-cell.component.html',
  styleUrls: ['./fl-spreadsheet-header-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetHeaderCellComponent implements OnInit, OnDestroy {

  @HostBinding('attr.' + headerIndexAttributeName)
  @Input() index: number;

  // if the header cell is a row or a column
  @HostBinding('attr.' + headerTypeAttributeName)
  @Input() type: FlHeaderCellType;

  subscription: Subscription;

  constructor(private state: FlSpreadsheetSelectionState,
              private renderer: Renderer2,
              private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.subscribeToSelection();
  }

  private subscribeToSelection(): void {
    this.subscription = this.state.getSelection().subscribe(
      selection => this.onSelectionChange(selection)
    );
  }

  private onSelectionChange(selection: FlSheetSelection): void {
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
  private isSelected(selection: FlSheetSelection): boolean {
    if (this.type === 'column') {
      return this.index >= selection.from.column && this.index <= selection.to.column;
    } else {
      return this.index >= selection.from.row && this.index <= selection.to.row;
    }
  }

  private getSelectedClass(): string {
    return this.type === 'column' ? 'column-selected' : 'row-selected';
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
