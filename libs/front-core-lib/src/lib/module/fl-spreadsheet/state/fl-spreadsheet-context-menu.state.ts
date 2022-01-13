import {Injectable} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlSpreadsheetActions} from './fl-spreadsheet-actions.state';
import {FlSpreadsheetChartState} from './fl-spreadsheet-chart.state';
import {FlSpreadsheetClipboardState} from './fl-spreadsheet-clipboard.state';
import {FlContextMenuService} from '../../fl-context-menu/fl-context-menu.service';
import {FlContextMenuButton, FlContextMenuConfig} from '../../fl-context-menu/fl-context-menu.class';


/**
 * State to handle context menu
 */
@Injectable()
export class FlSpreadsheetContextMenu {

  constructor(private selectionState: FlSpreadsheetSelectionState,
              private portalService: FlPortalService,
              private action: FlSpreadsheetActions,
              private chartState: FlSpreadsheetChartState,
              private clipboardState: FlSpreadsheetClipboardState,
              private contextMenuService: FlContextMenuService) {
  }

  public openCellContextMenu(mouseEvent: MouseEvent): void {
    this.contextMenuService.openContextMenu(this.getCellConfig(), mouseEvent.target as any);
  }

  public openHeaderColumnContextMenu(mouseEvent: MouseEvent): void {
    this.contextMenuService.openContextMenu(this.getConfigForHeaderColumn(), mouseEvent.target as any);
  }

  public openHeaderRowContextMenu(mouseEvent: MouseEvent): void {
    this.contextMenuService.openContextMenu(this.getConfigForHeaderRow(), mouseEvent.target as any);
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
          text: {text: 'flSpreadsheet.add', translateText: true},
          icon: 'add',
          onClick: () => this.action.addColumn()
        },
        // button to delete columns
        {
          text: {text: 'flSpreadsheet.delete', translateText: true},
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
          text: {text: 'flSpreadsheet.add', translateText: true},
          icon: 'add',
          onClick: () => this.action.addRow(),
          divider: true,
        },
        // button to delete rows
        {
          text: {text: 'flSpreadsheet.delete', translateText: true},
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
      text: {text: 'flSpreadsheet.create_chart', translateText: true},
      icon: 'addchart',
      onClick: () => this.chartState.openChartSelectionPortal(),
      divider: true
    };
  }

  private getCopyPasteConfig(): FlContextMenuButton[] {
    return [
      {
        text: {text: 'flSpreadsheet.copy', translateText: true},
        icon: 'content_copy',
        onClick: () => this.clipboardState.copyCurrentSelectionToClipboard(),
      },
      {
        text: {text: 'flSpreadsheet.paste', translateText: true},
        icon: 'content_paste',
        onClick: () => this.clipboardState.pasteClipboardValueToSelection()
      },

    ];
  }


}
