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
import {FlSpreadsheetState} from '../../state/fl-spreadsheet-state.service';
import {Subscription} from 'rxjs';
import {FlCellCoord, FlCellWithCoord, FlSheetSelectionRange} from '../../model/fl-sheet-selection-change.class';

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

  selectedBorderClasses: string[] = [];

  subscription: Subscription;


  constructor(private renderer: Renderer2, private elementRef: ElementRef<HTMLElement>,
              private state: FlSpreadsheetState, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.subscribeToSelection();
  }


  // enable edit mode on keydown event
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // ignore if we already are in edit mode
    // ignore if key is not a single character
    console.log('Keydown', event.key);
    if (this.edit || event.key.length > 1) {
      return;
    }

    this.cell.value += event.key;
    // when pressing a key, we enable the edit
    this.enableEditMode();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // left click
    if (event.button === 0) {
      this.state.startSelection();
      this.state.selectUniqueCell(this.cellWithCoord);
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.state.isSelecting) {
      this.state.expandSelection(this.coord);
    }
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

  enableEditMode(): void {
    if (!this.edit) {
      this.edit = true;
      setTimeout(() => {
        this.input?.nativeElement.focus();
      });
    }
  }


  disableEditMode(): void {
    this.edit = false;
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
