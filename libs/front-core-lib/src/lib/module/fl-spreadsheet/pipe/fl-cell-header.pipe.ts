import {Pipe, PipeTransform} from '@angular/core';
import {FlSpreadsheetHelper} from '../utils/fl-spreadsheet.helper';


/**
 * Pipe to display the value of a celle header (row or column)
 */
@Pipe({
  name: 'flCellHeader'
})
export class FlCellHeaderPipe implements PipeTransform {

  transform(index: number, type: 'row' | 'column'): string {
    if (index == null) {
      return '';
    }
    if (type === 'row') {
      return FlSpreadsheetHelper.rowIndexToName(index);
    } else {
      return FlSpreadsheetHelper.columnIndexToName(index);
    }
  }

}

