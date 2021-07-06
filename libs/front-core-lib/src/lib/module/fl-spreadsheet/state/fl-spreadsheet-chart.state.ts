import {Injectable} from '@angular/core';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlPortalConfig} from '../../fl-portal/model/fl-portal-config.class';
import {FlSpreadsheetChartSelectionComponent} from '../component/fl-spreadsheet-chart-selection/fl-spreadsheet-chart-selection.component';
import {FlOverlayRef} from '../../fl-portal/model/fl-overlay-ref.class';
import {FlChartPortalService} from '../../fl-chart/service/fl-chart-portal.service';
import {FlChartPortalConfig} from '../../fl-chart/model/fl-chart.class';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlSheetChartSelection} from '../model/chart/fl-sheet-chart-selection.class';
import {FlMenuDynamic} from '../../fl-menu-dynamic/model/fl-menu-dynamic.class';
import {FlSheetChartSelectionResult, FlSpreadsheetChartSelectionInput} from '../model/chart/fl-sheet-chart-selection-form.class';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlSpreadsheetChartSelectionFactory} from '../utils/fl-spreadsheet-chart-selection.factory';


interface SelectionWithOverlay {
  selection: FlSheetChartSelection;
  overlayRef: FlOverlayRef;
}

@Injectable()
export class FlSpreadsheetChartState {

  private overlayRef: FlOverlayRef;

  // store all the current overlay ref and the corresponding selection
  private currentSelections: Map<number, SelectionWithOverlay> = new Map();

  constructor(private state: FlSpreadsheetState,
              private portalService: FlPortalService,
              private chartPortalService: FlChartPortalService,
              private selectionState: FlSpreadsheetSelectionState) {
  }

  public openChartSelectionPortal(mouseEvent: MouseEvent, selection?: FlSheetChartSelection): void {
    // if the overlay is already open, do nothing
    if (this.overlayRef != null) {
      return;
    }

    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortalFromMouseEvent(mouseEvent,
      {
        panelClass: 'g-portal-background',
        elevation: true,
        disposeOnNavigation: true,

      });

    let data: FlSpreadsheetChartSelectionInput;
    // if we are in update mode
    if (selection != null) {
      data = {
        mode: 'update',
        selection: selection.selectionForm
      };
    } else {
      data = {
        mode: 'create',
        currentSelection: this.selectionState.currentSelection
      };
    }

    this.overlayRef = this.portalService.createPortal(FlSpreadsheetChartSelectionComponent, portalConfig, data);

    this.overlayRef.detachments().subscribe(
      (chartSelection) => this.openChartPortal(mouseEvent, chartSelection, selection?.id ?? null)
    );
  }

  private openUpdateChartSelectionPortal(mouseEvent: MouseEvent, selectionId: number): void {
    const selection: SelectionWithOverlay = this.currentSelections.get(selectionId);
    if (selection) {
      this.openChartSelectionPortal(mouseEvent, selection.selection);
    }
  }

  /**
   * Open the chart portal after chart selection
   * @param mouseEvent
   * @param result
   * @param fromSelectionId if provided and result.mode === 'update', the chart corresponding to the selection is deleted
   * @private
   */
  private openChartPortal(mouseEvent: MouseEvent, result ?: FlSheetChartSelectionResult, fromSelectionId?: number): void {
    this.overlayRef = null;

    if (result) {
      const selection: FlSheetChartSelection =
        FlSpreadsheetChartSelectionFactory.convertFormGpValueToSelectionChart(result.selection, this.state.currentSheet);

      const chartConfig: FlChartPortalConfig = {
        data: selection.exportToSeries(),
        chartType: selection.chartType,
        contextMenuItems: this.getContextMenuItem(selection.id)
      };


      const portalConfig: FlPortalConfig = this.chartPortalService.configureAbsolutePortalFromMouseEvent(mouseEvent,
        {
          panelClass: 'g-portal-background',
          elevation: true,
          disposeOnNavigation: true
        });

      const overlay: FlOverlayRef = this.chartPortalService.createDynamicChartPortal(chartConfig, portalConfig);

      // add the selection to the current
      this.currentSelections.set(selection.id, {
        overlayRef: overlay,
        selection: selection
      });

      // clear selection on chart close
      overlay.detachments().subscribe(
        () => this.clearSelection(selection.id)
      );

      // if this is an update mode, we delete the previous selection overlay
      if (result.mode === 'update' && fromSelectionId != null) {
        this.closeChartOverlay(fromSelectionId);
      }
    }
  }

  private closeChartOverlay(selectionId: number): void {
    this.currentSelections.get(selectionId)?.overlayRef.dispose();
  }

  private clearSelection(selectionId: number): void {
    this.currentSelections.delete(selectionId);
  }

  /**
   * return the context menu item for the chart container
   */
  private getContextMenuItem(selectionId: number): FlMenuDynamic[] {
    return [
      // button to edit the chart and reopen data selection
      {
        name: 'flSpreadsheet.chart_update',
        icon: 'edit',
        onClick: (event: MouseEvent) => this.openUpdateChartSelectionPortal(event, selectionId)
      }
    ];
  }
}
