import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {Observable, Subscription} from 'rxjs';
import {FlHeaderCellType, FlSheetSingleSelection} from '../../model/selection/fl-sheet-single-selection.class';
import {headerIndexAttributeName, headerTypeAttributeName} from '../../model/fl-cell.class';
import {FlSpreadsheetRendererState} from '../../state/fl-spreadsheet-renderer-state.service';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {FlSheetHeader} from '../../model/fl-sheet-row.class';

@Component({
  selector: 'fl-spreadsheet-header-cell',
  templateUrl: './fl-spreadsheet-header-cell.component.html',
  styleUrls: ['./fl-spreadsheet-header-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetHeaderCellComponent implements OnInit, OnDestroy {


  @HostBinding('attr.' + headerIndexAttributeName)
  @Input() index: number;

  @Input() header: FlSheetHeader;

  // if the header cell is a row or a column
  @HostBinding('attr.' + headerTypeAttributeName)
  @Input() type: FlHeaderCellType;

  colors$: Observable<string[]>;

  subscription: Subscription;

  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private renderer: Renderer2,
              private elementRef: ElementRef,
              private tagState: FlSpreadsheetRendererState) {
  }

  ngOnInit(): void {
    this.subscribeToSelection();
    this.subscribeToColor();
  }


  private subscribeToSelection(): void {
    this.subscription = this.selectionState.getSelection$().subscribe(
      selection => this.onSelectionChange(selection)
    );
  }

  private onSelectionChange(selection: FlSheetSingleSelection): void {
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
  private isSelected(selection: FlSheetSingleSelection): boolean {
    if (this.type === 'column') {
      return selection.columnIsSelected(this.index);
    } else {
      return selection.rowIsSelected(this.index);
    }
  }

  private getSelectedClass(): string {
    return this.type === 'column' ? 'column-selected' : 'row-selected';
  }

  /////////////////////////////// COLOR ///////////////////////////////
  private subscribeToColor(): void {
    if (this.type === 'row') {
      this.colors$ = this.tagState.getRowColors(this.index);
    } else {
      this.colors$ = this.tagState.getColumnColor(this.index);
    }
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
