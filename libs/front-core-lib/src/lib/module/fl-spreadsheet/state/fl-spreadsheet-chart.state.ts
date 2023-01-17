import {Injectable, OnDestroy} from '@angular/core';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlPortalConfig} from '../../fl-portal/model/fl-portal-config.class';
import {FlSheetChartSelectionComponent} from '../component/fl-sheet-chart-selection/fl-sheet-chart-selection.component';
import {FlOverlayRef} from '../../fl-portal/model/fl-overlay-ref.class';
import {FlChartPortalService} from '../../fl-chart/service/fl-chart-portal.service';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlMenuDynamic} from '../../fl-menu-dynamic/model/fl-menu-dynamic.class';
import {
  FlSheetChartSelectionForm,
  FlSheetChartSelectionResult,
  FlSpreadsheetChartSelectionInput
} from '../model/chart/fl-sheet-chart-selection-form.class';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {Observable, Subscription} from 'rxjs';
import {FlSnackBarService} from '../../fl-snack-bar/fl-snack-bar.service';
import {FlPortalActionsService} from '../../fl-portal-actions/service/fl-portal-actions.service';
import {FlPortalActionResult} from '../../fl-portal-actions/model/fl-portal-actions.class';


interface SelectionWithOverlay {
  selection: FlSheetChartSelectionForm;
  overlayRef: FlOverlayRef;
}

@Injectable()
export class FlSpreadsheetChartState implements OnDestroy {

  private overlayRef: FlOverlayRef;

  // store all the current overlay ref and the corresponding selection
  private currentSelections: Map<symbol, SelectionWithOverlay> = new Map();

  private chartActionName = 'spreadsheet-chart-create';

  private subscription: Subscription;

  constructor(private state: FlSpreadsheetState,
              private portalService: FlPortalService,
              private chartPortalService: FlChartPortalService,
              private selectionState: FlSpreadsheetSelectionState,
              private snackBarService: FlSnackBarService,
              private actionService: FlPortalActionsService) {

    // listen to chart creation actions
    this.subscription = this.actionService.getResult$(this.chartActionName).subscribe(
      (action: FlPortalActionResult<FlOverlayRef>) => {
        if (action.status === 'success') {
          this.registerPortalOverlay(action.result, action.additionalInformation);
        }
      });
  }

  public openChartSelectionPortal(selection?: FlSheetChartSelectionForm): void {
    // if the overlay is already open, do nothing
    if (this.overlayRef != null) {
      return;
    }

    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        disposeOnNavigation: true,
      });

    let data: FlSpreadsheetChartSelectionInput;
    // if we are in update mode
    if (selection != null) {
      data = {
        mode: 'update',
        selection: selection
      };
    } else {
      data = {
        mode: 'create',
        currentSelection: this.selectionState.currentSelection
      };
    }

    this.overlayRef = this.portalService.createPortal(FlSheetChartSelectionComponent, portalConfig, data);

    this.overlayRef.detachments().subscribe(
      (chartSelection) => this.generateChart(chartSelection, selection?.id ?? null)
    );
  }


  /**
   * Generate the chart config from select and open portal afterward
   * @param result
   * @param fromSelectionId if provided and result.mode === 'update', the chart corresponding to the selection is deleted
   * @private
   */
  private generateChart(result ?: FlSheetChartSelectionResult, fromSelectionId?: symbol): void {
    this.overlayRef = null;

    if (!result) return;

    // if this is an update mode, we close the previous selection overlay
    if (result.mode === 'update' && fromSelectionId != null) {
      this.closeChartOverlay(fromSelectionId);
    }

    // generate chart
    try {

      const chartConfig = this.state.getChartConfig(result.formValue.chartType);

      const chartOverlay = chartConfig.generateChart(
        result.formValue.series, result.formValue.additionalFields, this.state.currentSheet,
        this.getContextMenuItem(result.formValue.id));

      if (chartOverlay instanceof Observable) {
        // call the action service to register the chart creation
        this.actionService.addAction({
          type: this.chartActionName,
          action: chartOverlay,
          text: {text: 'flSpreadsheet.creating_chart', translateText: true},
          additionalInformation: result.formValue
        }, true);
      } else {
        this.registerPortalOverlay(chartOverlay, result.formValue);
      }
    } catch (e) {
      this.snackBarService.openErrorMessage('Error while generating chart');
      throw e;
    }
  }

  /**
   * Open the chart portal after chart selection
   * @private
   */
  private registerPortalOverlay(overlay: FlOverlayRef, formSelection: FlSheetChartSelectionForm): void {
    // add the selection to the current
    this.currentSelections.set(formSelection.id, {
      overlayRef: overlay,
      selection: formSelection
    });

    // clear selection on chart close
    overlay.detachments().subscribe(
      () => this.clearSelection(formSelection.id)
    );
  }

  /**
   * Open the chart selection portal in update mode
   * @param selectionId
   * @private
   */
  private openUpdateChartSelectionPortal(selectionId: symbol): void {
    const selection: SelectionWithOverlay = this.currentSelections.get(selectionId);
    if (selection) {
      this.openChartSelectionPortal(selection.selection);
    }
  }


  private closeChartOverlay(selectionId: symbol): void {
    this.currentSelections.get(selectionId)?.overlayRef.dispose();
  }

  private clearSelection(selectionId: symbol): void {
    this.currentSelections.delete(selectionId);
  }

  private closeAllOverlay(): void {
    for (const key of this.currentSelections.keys()) {
      this.closeChartOverlay(key);
    }
  }

  /**
   * return the context menu item for the chart container
   */
  private getContextMenuItem(selectionId: symbol): FlMenuDynamic[] {
    const menu: FlMenuDynamic[] = [];

    // button to edit the chart and reopen data selection
    menu.push({
      type: 'button',
      text: {text: 'flSpreadsheet.chart_update', translateText: true},
      icon: 'edit',
      onClick: () => this.openUpdateChartSelectionPortal(selectionId)
    });

    // button to close all overlay
    menu.push({
      type: 'button',
      text: {text: 'flSpreadsheet.chart_close_all', translateText: true},
      icon: 'clear',
      onClick: () => this.closeAllOverlay()
    });

    return menu;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
