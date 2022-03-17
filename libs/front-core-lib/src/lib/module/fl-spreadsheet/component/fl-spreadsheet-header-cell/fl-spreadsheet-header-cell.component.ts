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
import {FlSheetSingleSelection} from '../../model/selection/fl-sheet-single-selection.class';
import {FlHeaderCellType, headerIndexAttributeName, headerTypeAttributeName} from '../../model/fl-cell.class';
import {FlSpreadsheetRendererState} from '../../state/fl-spreadsheet-renderer-state.service';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {FlSheetHeader} from '../../model/fl-sheet-row.class';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {FlSheetHeaderInfo} from '../../model/fl-sheet.class';
import {FlPortalConnectedPosition} from '../../../fl-portal/model/fl-portal.class';
import {FlSpreadsheetHeaderInfoComponent} from '../fl-spreadsheet-header-info/fl-spreadsheet-header-info.component';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';

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

  private overlayRef: FlOverlayRef;

  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private renderer: Renderer2,
              private elementRef: ElementRef,
              private tagState: FlSpreadsheetRendererState,
              private portalService: FlPortalService) {
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

  /////////////////////////////// TAG COLORS ///////////////////////////////
  private subscribeToColor(): void {
    if (this.type === 'row') {
      this.colors$ = this.tagState.getRowColors(this.index);
    } else {
      this.colors$ = this.tagState.getColumnColor(this.index);
    }
  }


  /////////////////////////////// HEADER INFO ///////////////////////////////

  openHeaderPortal(): void {
    const sheet = this.state.currentSheet;
    let headerInfo: FlSheetHeaderInfo = null;
    if (this.type === 'row') {
      if (sheet.rowHasInfo(this.index)) {
        headerInfo = sheet.getRowInfo(this.index);
      }
    } else {
      if (sheet.columnHasInfo(this.index)) {
        headerInfo = sheet.getColumnInfo(this.index);
      }
    }

    // if there is no header info, do nothing
    if (!headerInfo) return;
    this.openHeaderInfoPortal(headerInfo);
  }



  private openHeaderInfoPortal(headerInfo: FlSheetHeaderInfo): void {
    const positions: FlPortalConnectedPosition[] = this.type === 'row' ? ['bottom', 'top', 'right', 'left'] :
      ['right', 'left', 'top', 'bottom'];

    const config = this.portalService.configureRelativePortal(this.elementRef.nativeElement, positions, {
      disposeOnNavigation: true,
      disposeOnOutsideClick: true,
      elevation: true
    });

    this.overlayRef = this.portalService.createPortal(FlSpreadsheetHeaderInfoComponent, config, headerInfo);
  }

  closePortal(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.closePortal();
  }

}
