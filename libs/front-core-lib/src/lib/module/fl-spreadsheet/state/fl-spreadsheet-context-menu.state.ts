import {Injectable} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlSpreadsheetActions} from './fl-spreadsheet-actions.state';
import {FlSpreadsheetChartState} from './fl-spreadsheet-chart.state';
import {FlSpreadsheetClipboardState} from './fl-spreadsheet-clipboard.state';
import {FlMenuDynamicService} from '../../fl-menu-dynamic/fl-menu-dynamic.service';
import {FlMenuDynamic} from '../../fl-menu-dynamic/model/fl-menu-dynamic.class';
import {FlSpreadsheetState} from './fl-spreadsheet.state';


/**
 * State to handle context menu
 */
@Injectable()
export class FlSpreadsheetContextMenu {

  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private portalService: FlPortalService,
              private action: FlSpreadsheetActions,
              private chartState: FlSpreadsheetChartState,
              private clipboardState: FlSpreadsheetClipboardState,
              private menuDynamicService: FlMenuDynamicService) {
  }

  public openCellContextMenu(mouseEvent: MouseEvent): void {
    this.menuDynamicService.openDynamicMenuFromMouseEvent(this.getCellConfig(), mouseEvent);
  }

  public openHeaderColumnContextMenu(mouseEvent: MouseEvent): void {
    this.menuDynamicService.openDynamicMenuFromMouseEvent(this.getConfigForHeaderColumn(), mouseEvent);
  }

  public openHeaderRowContextMenu(mouseEvent: MouseEvent): void {
    this.menuDynamicService.openDynamicMenuFromMouseEvent(this.getConfigForHeaderRow(), mouseEvent);
  }

  /**
   * Get config for the header column based on a selection
   */
  public getConfigForHeaderColumn(): FlMenuDynamic[] {
    const readOnly = this.state.readOnly;
    const menu = this.getCopyPasteConfig(readOnly);

    if (!readOnly) {
      menu.push(  // button to create a row
        // button to create a column
        {
          type: 'button',
          text: {text: 'flSpreadsheet.add', translateText: true},
          icon: 'add',
          onClick: () => this.action.addColumn()
        },
        // button to delete columns
        {
          type: 'button',
          text: {text: 'flSpreadsheet.delete', translateText: true},
          icon: 'delete',
          onClick: () => this.action.deleteColumns()
        }
      );
    }

    menu.push(this.getCreateChartConfig());
    return menu;
  }

  /**
   * Get config for the header row based on a selection
   */
  public getConfigForHeaderRow(): FlMenuDynamic[] {
    const readOnly = this.state.readOnly;
    const menu = this.getCopyPasteConfig(readOnly);

    if (!readOnly) {
      menu.push(  // button to create a row
        {
          type: 'button',
          text: {text: 'flSpreadsheet.add', translateText: true},
          icon: 'add',
          onClick: () => this.action.addRow(),
          divider: true,
        },
        // button to delete rows
        {
          type: 'button',
          text: {text: 'flSpreadsheet.delete', translateText: true},
          icon: 'delete',
          onClick: () => this.action.deleteRows()
        });
    }

    menu.push(this.getCreateChartConfig());

    return menu;
  }

  /**
   * Get config for the header row based on a selection
   */
  private getCellConfig(): FlMenuDynamic[] {
    const menu = this.getCopyPasteConfig(this.state.readOnly);

    menu.push(this.getCreateChartConfig());


    return menu;
  }

  private getCreateChartConfig(): FlMenuDynamic {
    return {
      type: 'button',
      text: {text: 'flSpreadsheet.create_chart', translateText: true},
      icon: 'addchart',
      onClick: () => this.chartState.openChartSelectionPortal(),
      divider: true
    };
  }

  private getCopyPasteConfig(readOnly: boolean): FlMenuDynamic[] {
    const menu: FlMenuDynamic[] = [{
      type: 'button',
      text: {text: 'flSpreadsheet.copy', translateText: true},
      icon: 'content_copy',
      onClick: () => this.clipboardState.copyCurrentSelectionToClipboard(),
    }];

    if (!readOnly) {
      menu.push({
        type: 'button',
        text: {text: 'flSpreadsheet.paste', translateText: true},
        icon: 'content_paste',
        onClick: () => this.clipboardState.pasteClipboardValueToSelection()
      });
    }

    return menu;
  }


}
