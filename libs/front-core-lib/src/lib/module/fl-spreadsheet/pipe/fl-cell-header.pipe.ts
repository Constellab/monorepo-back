import {Pipe, PipeTransform} from '@angular/core';
import {mergeMap, Observable, of} from 'rxjs';
import {FlSpreadsheetState} from '../state/fl-spreadsheet.state';


/**
 * Pipe to display the value of a celle header (row or column)
 */
@Pipe({
  name: 'flCellHeader'
})
export class FlCellHeaderPipe implements PipeTransform {

  constructor(private state: FlSpreadsheetState) {
  }

  transform(index: number, type: 'row' | 'column'): Observable<string> {
    if (index == null || index < 0) {
      return of('');
    }
    if (type === 'row') {
      return this.state.currentSheet$.pipe(
        mergeMap(sheet => sheet.getRowOffsetIndexName$(index))
      );
    } else {
      return this.state.currentSheet$.pipe(
        mergeMap(sheet => sheet.getColumnOffsetIndexName$(index))
      );
    }
  }

}

