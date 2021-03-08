import {Pipe, PipeTransform} from '@angular/core';

const columnNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

/**
 * Pipe to display the value of a celle header (row or column)
 */
@Pipe({
  name: 'cellHeader'
})
export class CellHeaderPipe implements PipeTransform {

  transform(index: number, type: 'row' | 'column'): string {
    if (index == null) {
      return '';
    }
    if (type === 'row') {
      return (index + 1).toString();
    } else {
      if (index === -1) {
        return '';
      }
      return this.getColumnName(index);
    }
  }

  // get column name like A, B, C, AA, AB...
  // by decomposing in base 26
  private getColumnName(index: number): string {


    let name = '';
    const letterCount: number = columnNames.length;

    do {
      const rest: number = index % letterCount;
      name = columnNames[rest] + name;

      if (index >= letterCount) {
        index = ((index - rest) / letterCount) - 1;
      } else {
        break;
      }
    } while (index >= 0);

    return name;
  }

}
