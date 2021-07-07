import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import {columnIdAttributeName, FlCell, FlCellEditChange, FlCellSelectionChange, rowIdAttributeName} from '../../model/fl-cell.class';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {FlCellCoord, FlCellWithCoord} from '../../model/selection/fl-sheet-single-selection.class';
import {ClSubscriptionHandler} from '@monorepo/core-lib';
import {FlSpreadsheetActions} from '../../state/fl-spreadsheet-actions.state';
import {FlKeyboardHelper, FlKeyboardKey} from '../../../../utils/fl-keyboard.helper';
import {FlSheetRange} from '../../model/selection/fl-sheet-range.class';

@Component({
  selector: 'fl-spreadsheet-cell',
  templateUrl: './fl-spreadsheet-cell.component.html',
  styleUrls: ['./fl-spreadsheet-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetCellComponent implements OnInit, OnDestroy, DoCheck {

  static id: number = 0;
  id: number;

  @Input() cell: FlCell;

  // theses attributes are used to retrieve the cell coords from html element
  @HostBinding('attr.' + columnIdAttributeName)
  @Input() column: number;

  @HostBinding('attr.' + rowIdAttributeName)
  @Input() row: number;


  @ViewChild('input') input: ElementRef<HTMLElement>;

  cellValue: any;
  inputValue: any;

  selected: boolean = false;
  edit: boolean = false;


  selectedBorderClasses: string[] = [];

  subscription: ClSubscriptionHandler = new ClSubscriptionHandler();


  constructor(private renderer: Renderer2, private elementRef: ElementRef<HTMLElement>,
              private state: FlSpreadsheetSelectionState,
              private actionState: FlSpreadsheetActions,
              private cdr: ChangeDetectorRef) {
    this.id = FlSpreadsheetCellComponent.id++;
  }

  ngOnInit(): void {
    this.subscribeToValue();
    this.subscribeToEdit();
    this.subscribeToSelection();
  }

  ngDoCheck(): void {
    if (this.id === 0) {
      console.log('Check');
    }
  }

  /////////////////////////////// VALUE ///////////////////////////////

  private subscribeToValue(): void {
    this.subscription.add(this.cell.value$.subscribe(
      value => this.onNewValue(value)
    ));
  }

  private onNewValue(value: any): void {
    this.cellValue = value;
    // use detect change because this code is run outside angular zone
    this.cdr.detectChanges();
  }


/////////////////////////////// SELECTION ///////////////////////////////

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

  private selectCell(range: FlSheetRange): void {
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
      this.cdr.detectChanges();
    }
  }


  /////////////////////////////// EDIT ///////////////////////////////

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
    // use detect change because this code is run outside angular zone
    this.cdr.detectChanges();
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
    }
  }

  private disableEditMode(): void {
    this.edit = false;
  }

  onInputKeyup(event: KeyboardEvent): void{
    if(event.key === FlKeyboardKey.ESCAPE){
      this.cancelEditMode();
    }
    else if(event.key === FlKeyboardKey.ENTER || FlKeyboardHelper.keyIsArrow(event.key)){
      this.saveValueAndDisableEdit();
    }
  }

  cancelEditMode(): void {
    this.cell.setEdit(false);
  }

  // save the input value to the cell and close edit mode
  saveValueAndDisableEdit(): void {
    this.actionState.updateCellValue(this.inputValue, this.coord);
    this.cell.setEdit(false);
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
  private getBorderClassesForSelectedRange(range: FlSheetRange): string[] {
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
