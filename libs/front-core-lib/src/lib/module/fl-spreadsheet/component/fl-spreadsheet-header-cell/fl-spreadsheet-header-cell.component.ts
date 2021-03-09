import {ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {Subscription} from 'rxjs';
import {FlSheetSelection, FlSheetSelectionRange} from '../../model/fl-sheet-selection-change.class';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {FlPortalConfig} from '../../../fl-portal/model/fl-portal-config.class';
import {FlSpreadsheetContextMenuComponent} from '../fl-spreadsheet-context-menu/fl-spreadsheet-context-menu.component';
import {FlContextMenuConfig, FlSpreadsheetContextMenu} from '../../state/fl-spreadsheet-context-menu.state';

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

  constructor(private state: FlSpreadsheetSelectionState,
              private renderer: Renderer2,
              private elementRef: ElementRef,
              private portalService: FlPortalService,
              private contextMenuConfigFactory: FlSpreadsheetContextMenu) {
  }

  ngOnInit(): void {
    this.renderer.addClass(this.elementRef.nativeElement, this.type);
    this.subscribeToSelection();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // left click or right click
    if (event.button === 0 || event.button === 2) {
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

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    // event.stopImmediatePropagation();
    event.preventDefault();

    this.openContextMenu(event);
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

  private openContextMenu(mouseEvent: MouseEvent): void {
    const portalConfig: FlPortalConfig =
      this.portalService.configureAbsolutePortalFromMouseEvent(mouseEvent, {
        panelClass: 'g-portal-background',
        elevation: true,
        disposeOnNavigation: true,
        disposeOnOutsideClick: true,
      });


    const data: FlContextMenuConfig = this.type === 'column' ?
      this.contextMenuConfigFactory.getConfigForHeaderColumn() :
      this.contextMenuConfigFactory.getConfigForHeaderRow();

    this.portalService.createPortal(FlSpreadsheetContextMenuComponent, portalConfig, data);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
