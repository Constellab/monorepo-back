import {Injectable} from '@angular/core';
import {FlCellCoord} from '../model/fl-cell-coord.class';
import {
  columnIdAttributeName,
  FlCell,
  FlHeaderCellType,
  headerIndexAttributeName,
  headerTypeAttributeName,
  rowIdAttributeName
} from '../model/fl-cell.class';
import {FlHtmlHelper} from '../../../utils/fl-html.helper';
import {FlSpreadsheetState} from './fl-spreadsheet.state';


export type FlSheetMouseEventCell = CellEvent | HeaderCellEvent;

interface CellEvent {
  type: 'cell';
  coord: FlCellCoord;
  cell: FlCell;
  element: HTMLElement;
}

interface HeaderCellEvent {
  type: 'header';
  headerType: FlHeaderCellType;
  index: number;
  element: HTMLElement;
}


/**
 * State for dom manipulation of the cells
 */
@Injectable()
export class FlSpreadsheetElementState {

  private tableContainer: HTMLElement;

  constructor(private state: FlSpreadsheetState){

  }

  public init(tableContainer: HTMLElement): void {
    this.tableContainer = tableContainer;
  }

  /**
   * Retrieve the header cell element from the column id
   * @param columnId
   */
  public getColumnHeaderCellElement(columnId: number): HTMLElement {
    return this.tableContainer.querySelector(`[${headerTypeAttributeName}="column"][${headerIndexAttributeName}="${columnId}"]`);
  }

  public getCellFromHTMLElement(element: HTMLElement): FlSheetMouseEventCell | null {
    // search if this is a cell
    let cellElement = FlHtmlHelper.getParent(element, {tagName: 'FL-SPREADSHEET-CELL'});
    if (cellElement) {
      return this.getNormalCellFromHTMLElement(cellElement);
    }

    // search if this is a header cell
    cellElement = FlHtmlHelper.getParent(element, {tagName: 'FL-SPREADSHEET-HEADER-CELL'});
    if (cellElement) {
      return this.getHeaderCellFromHTMLElement(cellElement);
    }

    return null;
  }

  // returns cell based on a html element : FL-SPREADSHEET-CELL
  private getNormalCellFromHTMLElement(element: HTMLElement): CellEvent {
    const row: number = parseInt(element.getAttribute(rowIdAttributeName));
    const column: number = parseInt(element.getAttribute(columnIdAttributeName));

    return {
      type: 'cell',
      cell: this.state.currentSheet.getCell(row, column),
      coord: {
        row: row,
        column: column
      },
      element: element
    };
  }

  // returns header cell info based on a html element : FL-SPREADSHEET-HEADER-CELL
  private getHeaderCellFromHTMLElement(element: HTMLElement): HeaderCellEvent {
    const index: number = parseInt(element.getAttribute(headerIndexAttributeName));
    const type: FlHeaderCellType = element.getAttribute(headerTypeAttributeName) as FlHeaderCellType;

    return {
      type: 'header',
      headerType: type,
      index: index,
      element: element
    };
  }

}
