import {Injectable} from '@angular/core';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlPortalConfig} from '../../fl-portal/model/fl-portal-config.class';
import {FlSheetChartSelectionComponent} from '../component/fl-sheet-chart-selection/fl-sheet-chart-selection.component';
import {FlOverlayRef} from '../../fl-portal/model/fl-overlay-ref.class';
import {FlChartPortalService} from '../../fl-chart/service/fl-chart-portal.service';
import {FlChartPortalConfig, FlChartType} from '../../fl-chart/model/fl-chart.class';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlMenuDynamic} from '../../fl-menu-dynamic/model/fl-menu-dynamic.class';
import {
  FlSheetChartSelectionForm,
  FlSheetChartSelectionResult,
  FlSpreadsheetChartSelectionInput
} from '../model/chart/fl-sheet-chart-selection-form.class';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlChartConfig} from '../../fl-chart/model/fl-chart-config.class';
import {Observable} from 'rxjs';
import {FlSheetChartService} from '../model/chart/fl-sheet-chart.service';
import {FlSheet} from '../model/fl-sheet.class';
import {FlSheetChartLocalService} from '../model/chart/fl-sheet-chart-local.service';


interface SelectionWithOverlay {
  selection: FlSheetChartSelectionForm;
  overlayRef: FlOverlayRef;
}

@Injectable()
export class FlSpreadsheetChartState {

  private overlayRef: FlOverlayRef;

  // store all the current overlay ref and the corresponding selection
  private currentSelections: Map<symbol, SelectionWithOverlay> = new Map();

  constructor(private state: FlSpreadsheetState,
              private portalService: FlPortalService,
              private chartPortalService: FlChartPortalService,
              private selectionState: FlSpreadsheetSelectionState) {
  }

  public openChartSelectionPortal(selection?: FlSheetChartSelectionForm): void {
    // if the overlay is already open, do nothing
    if (this.overlayRef != null) {
      return;
    }

    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
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

    // get the service used to generate the chart
    const chartService = this.getChartService(this.state.currentSheet);
    // generate chart config
    const chartConfig = this.getChartConfig(chartService, result.selection);

    if (chartConfig instanceof Observable) {
      chartConfig.subscribe(
        conf => this.openChartPortal(conf, result.selection)
      );
    } else {
      this.openChartPortal(chartConfig, result.selection);
    }
  }

  /**
   * Open the chart portal after chart selection
   * @private
   */
  private openChartPortal(chartConfig: FlChartConfig, formSelection: FlSheetChartSelectionForm): void {
    const chartPortalConfig: FlChartPortalConfig = {
      chart: chartConfig,
      contextMenuItems: this.getContextMenuItem(formSelection.id)
    };


    const portalConfig: FlPortalConfig = this.chartPortalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true
      });

    const overlay: FlOverlayRef = this.chartPortalService.createDynamicChartPortal(chartPortalConfig, portalConfig);

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

  // return true if we can make chart from the sheet
  public chartAreEnabled(): boolean {
    return this.state.getChartService() != null;
  }

  /**
   * Get the correct chart service. If a FlSheetChartService was injected, use it, otherwise use the local chart
   */
  private getChartService(sheet: FlSheet): FlSheetChartService {
    const chartService = this.state.getChartService();
    if (chartService) {
      return chartService;
    }
    return new FlSheetChartLocalService(sheet);
  }

  private getChartConfig(chartService: FlSheetChartService,
                         formValue: FlSheetChartSelectionForm): FlChartConfig | Observable<FlChartConfig> {
    switch (formValue.chartType) {
      case FlChartType.SCATTER_PLOT:
        return chartService.generateScatterPlot2d(formValue.series);
      case FlChartType.LINE:
        return chartService.generateLine2d(formValue.series);
      case FlChartType.HISTOGRAM:
        return chartService.generateHistogram(formValue.series, formValue.additionalFields.nbOfBins, formValue.additionalFields.density);
      case FlChartType.BOX_PLOT:
        return chartService.generateBoxPlot(formValue.series);
      case FlChartType.BAR_PLOT:
        return chartService.generateBar(formValue.series);
      case FlChartType.STACKED_PLOT:
        return chartService.generateStackBar(formValue.series, formValue.additionalFields.normalize);
      case FlChartType.HEAT_MAP:
        return chartService.generateHeatMap(formValue.series[0]);
      case FlChartType.VENN_DIAGRAM:
        return chartService.generateVennDiagram(formValue.series);
      default:
        console.error(`[FlSpreadsheetChartState] The chart type ${formValue.chartType} is not supported`);
        return null;
    }
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
}
