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
import {FlCell, FlCellSelectionChange} from '../../model/fl-cell.class';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {Subscription} from 'rxjs';
import {FlCellCoord, FlCellWithCoord, FlSheetSelectionRange} from '../../model/fl-sheet-selection-change.class';
import {FlKeyboardHelper, FlKeyboardKey} from '../../../../utils/fl-keyboard.helper';

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

  @ViewChild('container', {static: true}) content: ElementRef<HTMLElement>;
  @ViewChild('input') input: ElementRef<HTMLElement>;

  selected: boolean = false;
  edit: boolean = false;

  cellValue: any;

  selectedBorderClasses: string[] = [];

  subscription: Subscription;


  constructor(private renderer: Renderer2, private elementRef: ElementRef<HTMLElement>,
              private state: FlSpreadsheetSelectionState, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.subscribeToSelection();
  }


  // enable edit mode on keydown event
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    console.log('Keydown', event.key, event.ctrlKey, event.altKey);

    if (!this.edit) {
      if (event.key === FlKeyboardKey.DELETE) {
        this.cell.value = '';
      } else if (FlKeyboardHelper.keyboardKeyIsPrintable(event.key)) {
        // when pressing a key, we enable the edit
        this.enableEditMode(this.cell.value + event.key);
      }

    }

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
    this.enableEditMode(this.cell.value);
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
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
    this.subscription = this.cell.getSelected$().subscribe(
      selected => this.onSelectionChange(selected)
    );
  }

  private onSelectionChange(selected: FlCellSelectionChange): void {
    if (selected === false) {
      this.unSelectCell();
    } else {
      this.selectCell(selected);
    }
  }

  enableEditMode(value: any): void {
    if (!this.edit) {
      this.edit = true;
      this.cellValue = value;
      setTimeout(() => {
        this.input?.nativeElement.focus();
      });
      this.cdr.markForCheck();
    }
  }

  cancelEditMode(): void {
    this.disableEditMode();
  }

  validateEditMode(): void {
    this.cell.value = this.cellValue;
    this.disableEditMode();
  }


  private disableEditMode(): void {
    this.edit = false;
    this.cdr.markForCheck();
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
