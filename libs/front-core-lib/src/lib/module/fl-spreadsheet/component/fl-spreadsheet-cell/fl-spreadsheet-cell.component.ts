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
import {columnIdAttributeName, FlCell, FlCellEditChange, rowIdAttributeName} from '../../model/fl-cell.class';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {FlCellWithCoord, FlSheetSingleSelection} from '../../model/selection/fl-sheet-single-selection.class';
import {ClSubscriptionHandler} from '@monorepo/core-lib';
import {FlSpreadsheetActions} from '../../state/fl-spreadsheet-actions.state';
import {FlKeyboardHelper, FlKeyboardKey} from '../../../../utils/fl-keyboard.helper';
import {FlCellsRange} from '../../model/selection/fl-cells-range.class';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {FlCellCoord} from '../../model/fl-cell-coord.class';
import {FlPortalConnectedPosition} from '../../../fl-portal/model/fl-portal.class';
import {FlSpreadsheetCellInfoComponent} from '../fl-spreadsheet-cell-info/fl-spreadsheet-cell-info.component';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';

@Component({
  selector: 'fl-spreadsheet-cell',
  templateUrl: './fl-spreadsheet-cell.component.html',
  styleUrls: ['./fl-spreadsheet-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetCellComponent implements OnInit, OnDestroy, DoCheck {

  // use to check change detection
  // todo to remove
  private static id: number = 0;
  private id: number;

  @Input() cell: FlCell;

  // theses attributes are used to retrieve the cell coords from html element
  @HostBinding('attr.' + columnIdAttributeName)
  @Input() column: number;

  @HostBinding('attr.' + rowIdAttributeName)
  @Input() row: number;


  @ViewChild('input') input: ElementRef<HTMLElement>;

  cellValue: any;
  inputValue: any;
  cellValueIsObject: boolean;

  edit: boolean = false;

  private selected: boolean = false;

  private selectedBorderClasses: string[] = [];

  private subscription: ClSubscriptionHandler = new ClSubscriptionHandler();

  private overlayRef: FlOverlayRef;

  constructor(private renderer: Renderer2, private elementRef: ElementRef<HTMLElement>,
              private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private actionState: FlSpreadsheetActions,
              private cdr: ChangeDetectorRef,
              private portalService: FlPortalService) {
    this.id = FlSpreadsheetCellComponent.id++;
  }

  ngOnInit(): void {
    this.cellValueIsObject = this.cell.valueIsObject();
    this.subscribeToValue();
    this.subscribeToEdit();
    this.subscribeToSelection();
  }

  ngDoCheck(): void {
    // if (this.id === 0) {
    //   console.log('Check');
    // }
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
    this.subscription.add(this.selectionState.getSelection$().subscribe(
      selection => this.onSelectionChange(selection)
    ));
  }

  private onSelectionChange(selection: FlSheetSingleSelection): void {
    // check if the current cell is selected
    if (selection && selection.coordIsSelected({row: this.row, column: this.column})) {
      this.selectCell(selection.getRange());
    } else {
      this.unSelectCell();
    }
  }

  private selectCell(range: FlCellsRange): void {
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

  onInputKeyup(event: KeyboardEvent): void {
    if (event.key === FlKeyboardKey.ESCAPE) {
      this.cancelEditMode();
    } else if (event.key === FlKeyboardKey.ENTER || FlKeyboardHelper.keyIsArrow(event.key)) {
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
  private getBorderClassesForSelectedRange(range: FlCellsRange): string[] {
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

  openCellValueIsNewSheet(): void {
    this.state.openCellInNewSheet(this.cell);
  }

  /////////////////////////////// CELL INFO ///////////////////////////////
  openInfoPortal(): void {
    const positions: FlPortalConnectedPosition[] = ['right', 'left', 'top', 'bottom'];

    const config = this.portalService.configureRelativePortal(this.elementRef.nativeElement, positions, {
      disposeOnNavigation: true,
      disposeOnOutsideClick: true,
      elevation: true
    });

    this.overlayRef = this.portalService.createPortal(FlSpreadsheetCellInfoComponent, config, this.cellWithCoord);
  }

  closePortal(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
