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
import {FlPortalConnectedPosition} from '../../fl-portal/model/fl-portal.class';
import {FlSpreadsheetClipboardState} from './fl-spreadsheet-clipboard.state';

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
 */
@Injectable()
export class FlSpreadsheetContextMenu {

  constructor(private selectionState: FlSpreadsheetSelectionState,
              private portalService: FlPortalService,
              private action: FlSpreadsheetActions,
              private chartState: FlSpreadsheetChartState,
              private clipboardState: FlSpreadsheetClipboardState) {
  }

  public openCellContextMenu(mouseEvent: MouseEvent): void {
    const portalConfig: FlPortalConfig = this.getMenuPortalConfig(mouseEvent);
    this.portalService.createPortal(FlSpreadsheetContextMenuComponent, portalConfig,
      this.getCellConfig());
  }

  public openHeaderColumnContextMenu(mouseEvent: MouseEvent): void {
    const portalConfig: FlPortalConfig = this.getMenuPortalConfig(mouseEvent);
    this.portalService.createPortal(FlSpreadsheetContextMenuComponent, portalConfig,
      this.getConfigForHeaderColumn());
  }

  public openHeaderRowContextMenu(mouseEvent: MouseEvent): void {
    const portalConfig: FlPortalConfig = this.getMenuPortalConfig(mouseEvent);
    this.portalService.createPortal(FlSpreadsheetContextMenuComponent, portalConfig,
      this.getConfigForHeaderRow());
  }

  private getMenuPortalConfig(mouseEvent: MouseEvent): FlPortalConfig {
    const positions: FlPortalConnectedPosition[] = ['right', 'top', 'left', 'bottom'];

    return this.portalService.configureRelativePortal(mouseEvent.target as any, positions, {
      panelClass: 'g-portal-background',
      elevation: true,
      disposeOnNavigation: true,
      disposeOnOutsideClick: true,
    });
  }

  /**
   * Get config for the header column based on a selection
   */
  public getConfigForHeaderColumn(): FlContextMenuConfig {

    return {
      buttons: [
        ...this.getCopyPasteConfig(),
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
        this.getCreateChartConfig()
      ]
    };
  }

  /**
   * Get config for the header row based on a selection
   */
  public getConfigForHeaderRow(): FlContextMenuConfig {
    return {
      buttons: [
        ...this.getCopyPasteConfig(),
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
        this.getCreateChartConfig()
      ]
    };
  }

  /**
   * Get config for the header row based on a selection
   */
  public getCellConfig(): FlContextMenuConfig {
    return {
      buttons: [
        ...this.getCopyPasteConfig(),
        this.getCreateChartConfig()
      ]
    };
  }

  private getCreateChartConfig(): FlContextMenuButton {
    return {
      text: 'flSpreadsheet.create_chart',
      icon: 'addchart',
      onClick: () => this.chartState.openChartSelectionPortal()
    };
  }

  private getCopyPasteConfig(): FlContextMenuButton[] {
    return [
      {
        text: 'flSpreadsheet.copy',
        icon: 'content_copy',
        onClick: () => this.clipboardState.copyCurrentSelectionToClipboard()
      },
      {
        text: 'flSpreadsheet.paste',
        icon: 'content_paste',
        onClick: () => this.clipboardState.pasteClipboardValueToSelection()
      },

    ];
  }


}
