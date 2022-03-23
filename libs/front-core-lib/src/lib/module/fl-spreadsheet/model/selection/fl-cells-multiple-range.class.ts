import {FlCellsRange} from './fl-cells-range.class';
import {FlSpreadsheetHelper} from '../../utils/fl-spreadsheet.helper';
import {FlCellCoordRange} from '../fl-cell-coord.class';


export class FlCellsMultipleRange {

  ranges: FlCellsRange[];

  constructor(ranges: FlCellsRange[] = []) {
    this.ranges = ranges;
  }

  // generate a multi selection from a string like B2:G5,B5:T4 (separated by ',')
  public static fromString(selection: string): FlCellsMultipleRange {
    const ranges: FlCellsRange[] = [];

    const strRanges: string[] = selection.split(FlSpreadsheetHelper.selectionsSplitter);
    for (const strRange of strRanges) {
      ranges.push(FlCellsRange.MultipleFromString(strRange));
    }

    return new FlCellsMultipleRange(ranges);
  }

  public static fromCoords(coords: FlCellCoordRange[]): FlCellsMultipleRange {
    const ranges = coords.map(coord => FlCellsRange.MultipleFromCoords(coord));
    return new FlCellsMultipleRange(ranges);
  }

  public addRange(range: FlCellsRange): void {
    this.ranges.push(range);
  }

  public toCoords(): FlCellCoordRange[] {
    return this.ranges.map(range => range.toCoords());
  }

  public countCells(): number {
    let sum = 0;
    for (const range of this.ranges) {
      sum += range.countCells();
    }
    return sum;
  }

  // return all selection as text like B2:G5,B5:T4 (separated by ',')
  public toString(): string {
    let str: string = '';
    for (const range of this.ranges) {
      if (str !== '') {
        str += FlSpreadsheetHelper.selectionsSplitter;
      }
      str += range.toString();
    }
    return str;
  }

}

