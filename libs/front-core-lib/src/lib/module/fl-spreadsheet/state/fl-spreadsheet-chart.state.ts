import {Injectable} from '@angular/core';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlPortalConfig} from '../../fl-portal/model/fl-portal-config.class';
import {FlSpreadsheetChartSelectionComponent} from '../component/fl-spreadsheet-chart-selection/fl-spreadsheet-chart-selection.component';
import {FlOverlayRef} from '../../fl-portal/model/fl-overlay-ref.class';
import {FlSheetChartSelection} from '../model/fl-sheet-chart-selection.class';
import {FlChartPortalService} from '../../fl-chart/service/fl-chart-portal.service';
import {FlChartDynamicConfig} from '../../fl-chart/model/fl-chart-component.class';


@Injectable()
export class FlSpreadsheetChartState {

  private overlayRef: FlOverlayRef;


  constructor(private portalService: FlPortalService,
              private chartPortalService: FlChartPortalService) {
  }

  public openChartSelectionDialog(mouseEvent: MouseEvent): void {
    // if the overlay is already open, do nothing
    if (this.overlayRef != null) {
      return;
    }

    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortalFromMouseEvent(mouseEvent,
      {
        panelClass: 'g-portal-background',
        elevation: true,
        disposeOnNavigation: true
      });

    this.overlayRef =
      this.portalService.createPortal(FlSpreadsheetChartSelectionComponent, portalConfig);

    this.overlayRef.detachments().subscribe(
      (chartSelection) => this.onDispose(mouseEvent, chartSelection)
    );
  }

  private onDispose(mouseEvent: MouseEvent, chartSelection?: FlSheetChartSelection): void {
    this.overlayRef = null;

    if (chartSelection) {
      const chartConfig: FlChartDynamicConfig = {
        data: chartSelection.exportToSeries(),
        chartType: chartSelection.chartType
      };


      const portalConfig: FlPortalConfig = this.chartPortalService.configureAbsolutePortalFromMouseEvent(mouseEvent,
        {
          panelClass: 'g-portal-background',
          elevation: true,
          disposeOnNavigation: true
        });

      this.chartPortalService.createDynamicChartPortal(chartConfig, portalConfig);
    }
  }
}
