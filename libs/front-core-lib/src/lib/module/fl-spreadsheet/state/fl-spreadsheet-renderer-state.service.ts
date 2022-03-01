import {Injectable} from '@angular/core';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FlSheetHeaderInfo} from '../model/fl-sheet.class';
import {FlTagWithColor} from '../../fl-tag/fl-tag.class';


@Injectable()
export class FlSpreadsheetRendererState {

  private rowColors$: BehaviorSubject<Record<number, string[]>> = new BehaviorSubject({});
  private columnColors$: BehaviorSubject<Record<number, string[]>> = new BehaviorSubject({});

  constructor(private state: FlSpreadsheetState) {

  }

  public getRowColors(rowId: number): Observable<string[]> {
    return this.rowColors$.pipe(
      map(colors => colors[rowId])
    );
  }

  public getColumnColor(columnId: number): Observable<string[]> {
    return this.columnColors$.pipe(
      map(colors => colors[columnId])
    );
  }

  public setRowTagColors(tagWithColors: FlTagWithColor[]): void {
    const sheet = this.state.currentSheet;
    const rowColors = this.convertToHeaderColors(tagWithColors, sheet.rowsInfo);
    this.rowColors$.next(rowColors);
  }

  public setColumnTagColors(tagWithColors: FlTagWithColor[]): void {
    const sheet = this.state.currentSheet;
    const columnColors = this.convertToHeaderColors(tagWithColors, sheet.columnsInfo);
    this.columnColors$.next(columnColors);
  }

  private convertToHeaderColors(tagWithColors: FlTagWithColor[], headerInfo: FlSheetHeaderInfo[]): Record<number, string[]> {
    const headerColors: Record<number, string[]> = {};
    let headerIndex = 0;
    for (const header of headerInfo) {
      const colors = [];

      // search if the row has a tag from the tag with colors
      for (const tagWithColor of tagWithColors) {
        // if the row has the tag (key/value)
        if (header.tags[tagWithColor.key] === tagWithColor.value) {
          colors.push(tagWithColor.color);
        }
      }

      headerColors[headerIndex] = colors;
      headerIndex++;
    }

    return headerColors;

  }
}
