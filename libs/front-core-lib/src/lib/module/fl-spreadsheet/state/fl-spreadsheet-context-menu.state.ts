/**
 * Config object for the Context menu of a spread sheet
 */
import {Injectable} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlPortalConfig} from '../../fl-portal/model/fl-portal-config.class';
import {FlSpreadsheetContextMenuComponent} from '../component/fl-spreadsheet-context-menu/fl-spreadsheet-context-menu.component';
import {FlSpreadsheetActions} from './fl-spreadsheet-actions.state';
import {FlSpreadsheetChartState} from './fl-spreadsheet-chart.state';

export interface FlContextMenuConfig {
  buttons: FlContextMenuButton[];
}

/**
 * Configuration for one button in the Context Menu
 */
export interface FlContextMenuButton {
  text: string;
  icon: string;
  onClick: () => any;
}

/**
 * State to handle context menu
 * todo : change to service instead of state ?
 */
@Injectable()
export class FlSpreadsheetContextMenu {

  constructor(private selectionState: FlSpreadsheetSelectionState,
              private portalService: FlPortalService,
              private action: FlSpreadsheetActions,
              private chartState: FlSpreadsheetChartState) {
  }

  public openCellContextMenu(mouseEvent: MouseEvent): void {
    const portalConfig: FlPortalConfig = this.getMenuPortalConfig(mouseEvent);
    this.portalService.createPortal(FlSpreadsheetContextMenuComponent, portalConfig,
      this.getCellConfig(mouseEvent));
  }

  public openHeaderColumnContextMenu(mouseEvent: MouseEvent): void {
    const portalConfig: FlPortalConfig = this.getMenuPortalConfig(mouseEvent);
    this.portalService.createPortal(FlSpreadsheetContextMenuComponent, portalConfig,
      this.getConfigForHeaderColumn(mouseEvent));
  }

  public openHeaderRowContextMenu(mouseEvent: MouseEvent): void {
    const portalConfig: FlPortalConfig = this.getMenuPortalConfig(mouseEvent);
    this.portalService.createPortal(FlSpreadsheetContextMenuComponent, portalConfig,
      this.getConfigForHeaderRow(mouseEvent));
  }

  private getMenuPortalConfig(mouseEvent: MouseEvent): FlPortalConfig {
    return this.portalService.configureAbsolutePortalFromMouseEvent(mouseEvent, {
      panelClass: 'g-portal-background',
      elevation: true,
      disposeOnNavigation: true,
      disposeOnOutsideClick: true,
    });
  }

  /**
   * Get config for the header column based on a selection
   */
  public getConfigForHeaderColumn(mouseEvent: MouseEvent): FlContextMenuConfig {

    return {
      buttons: [
        // button to create a column
        {
          text: 'flSpreadsheet.add',
          icon: 'add',
          onClick: () => this.action.addColumn()
        },
        // button to delete columns
        {
          text: 'flSpreadsheet.delete',
          icon: 'delete',
          onClick: () => this.action.deleteColumns()
        },
        this.getCreateChartConfig(mouseEvent)
      ]
    };
  }

  /**
   * Get config for the header row based on a selection
   */
  public getConfigForHeaderRow(mouseEvent: MouseEvent): FlContextMenuConfig {
    return {
      buttons: [
        // button to create a row
        {
          text: 'flSpreadsheet.add',
          icon: 'add',
          onClick: () => this.action.addRow()
        },
        // button to delete rows
        {
          text: 'flSpreadsheet.delete',
          icon: 'delete',
          onClick: () => this.action.deleteRows()
        },
        this.getCreateChartConfig(mouseEvent)
      ]
    };
  }

  /**
   * Get config for the header row based on a selection
   */
  public getCellConfig(mouseEvent: MouseEvent): FlContextMenuConfig {
    return {
      buttons: [this.getCreateChartConfig(mouseEvent)]
    };
  }

  private getCreateChartConfig(mouseEvent: MouseEvent): FlContextMenuButton {
    return {
      text: 'flSpreadsheet.create_chart',
      icon: 'addchart',
      onClick: () => this.chartState.openChartSelectionDialog(mouseEvent)
    };
  }


}
