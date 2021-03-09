import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import {FlCell, FlCellEditChange, FlCellSelectionChange} from '../../model/fl-cell.class';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {Observable} from 'rxjs';
import {FlCellCoord, FlCellWithCoord, FlSheetSelectionRange} from '../../model/fl-sheet-selection.class';
import {ClSubscriptionHandler} from '@monorepo/core-lib';

@Component({
  selector: 'fl-spreadsheet-cell',
  templateUrl: './fl-spreadsheet-cell.component.html',
  styleUrls: ['./fl-spreadsheet-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetCellComponent implements OnInit, OnDestroy {

  @Input() cell: FlCell;

  @Input() column: number;

  @Input() row: number;

  @ViewChild('input') input: ElementRef<HTMLElement>;

  cellValue$: Observable<any>;
  inputValue: any;

  selected: boolean = false;
  edit: boolean = false;


  selectedBorderClasses: string[] = [];

  subscription: ClSubscriptionHandler = new ClSubscriptionHandler();


  constructor(private renderer: Renderer2, private elementRef: ElementRef<HTMLElement>,
              private state: FlSpreadsheetSelectionState, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.cellValue$ = this.cell.value$;
    this.subscribeToEdit();
    this.subscribeToSelection();
  }


  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // left click
    if (event.button === 0) {
      this.state.selectUniqueCell(this.cellWithCoord);
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.state.isSelecting) {
      this.state.expandSelection(this.coord);
    }
  }

  @HostListener('dblclick')
  onDoubleClick(): void {
    this.cell.setEdit(true);
  }

  private selectCell(range: FlSheetSelectionRange): void {
    if (!this.selected) {
      this.renderer.addClass(this.elementRef.nativeElement, 'cell-selected');
      this.selected = true;
    }
    // remove previous border classes
    this.removeClasses(this.selectedBorderClasses);

    // add new border classes
    this.selectedBorderClasses = this.getBorderClassesForSelectedRange(range);
    this.addClasses(this.selectedBorderClasses);

    this.cdr.markForCheck();
  }

  private unSelectCell(): void {
    if (this.selected) {
      this.selected = false;
      this.renderer.removeClass(this.elementRef.nativeElement, 'cell-selected');

      // clear border classes
      this.removeClasses(this.selectedBorderClasses);
      this.selectedBorderClasses = [];
      this.cdr.markForCheck();
    }
  }


  private subscribeToSelection(): void {
    this.subscription.add(this.cell.getSelected$().subscribe(
      selected => this.onSelectionChange(selected)
    ));
  }

  private onSelectionChange(selected: FlCellSelectionChange): void {
    if (selected === false) {
      this.unSelectCell();
    } else {
      this.selectCell(selected);
    }
  }

  private subscribeToEdit(): void {
    this.subscription.add(this.cell.edit$.subscribe(
      edit => this.onEditChange(edit)
    ));
  }

  private onEditChange(editEvent: FlCellEditChange): void {
    if (editEvent.edit) {
      this.enableEditMode(editEvent.value);
    } else {
      this.disableEditMode();
    }
  }

  private enableEditMode(value?: string): void {
    if (!this.edit) {
      const cellValue: any = this.cell.value;
      this.edit = true;

      if (value != null &&
        (typeof this.cell.value === 'number' || typeof this.cell.value === 'string')) {
        this.inputValue = cellValue + value;
      } else {
        this.inputValue = cellValue;
      }

      setTimeout(() => {
        this.focusInput();
      });
      this.cdr.markForCheck();
    }
  }

  private disableEditMode(): void {
    this.edit = false;
    this.cdr.markForCheck();
  }

  cancelEditMode(): void {
    this.cell.setEdit(false);
  }

  // save the input value to the cell and close edit mode
  saveValueAndDisableEdit(): void {
    this.cell.setValueAndCloseEdit(this.inputValue);
  }

  private focusInput(): void {
    this.input?.nativeElement.focus();
  }


  get cellWithCoord(): FlCellWithCoord {
    return {
      cell: this.cell,
      coord: this.coord
    };
  }

  get coord(): FlCellCoord {
    return {
      column: this.column,
      row: this.row
    };
  }

  // return the list of border classes to apply based on selected range
  private getBorderClassesForSelectedRange(range: FlSheetSelectionRange): string[] {
    const classes: string[] = [];
    if (range.from.row === this.row) {
      classes.push('selected-border-top');
    }
    if (range.to.row === this.row) {
      classes.push('selected-border-bottom');
    }
    if (range.from.column === this.column) {
      classes.push('selected-border-left');
    }
    if (range.to.column === this.column) {
      classes.push('selected-border-right');
    }

    return classes;
  }

  private addClasses(classes: string[]): void {
    for (const className of classes) {
      this.renderer.addClass(this.elementRef.nativeElement, className);
    }
  }

  private removeClasses(classes: string[]): void {
    for (const className of classes) {
      this.renderer.removeClass(this.elementRef.nativeElement, className);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
