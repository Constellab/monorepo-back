import {FlSheetSingleSelection, FlSheetSingleSelectionFull} from './fl-sheet-single-selection.class';
import {FlCell} from '../fl-cell.class';
import {FlSheet} from '../fl-sheet.class';
import {FlSheetSelection} from './fl-sheet-selection.class';
import {FlCellsMultipleRange} from './fl-cells-multiple-range.class';

/**
 * Object to manager multiple selections
 */
export class FlSheetMultiSelection implements FlSheetSelection {

  selections: FlSheetSingleSelection[];

  constructor(selections: FlSheetSingleSelection[] = []) {
    this.selections = selections;
  }

  // generate a multi selection from a string like B2:G5,B5:T4 (separated by ',')
  public static fromString(sheet: FlSheet, selection: string): FlSheetMultiSelection {
    const ranges = FlCellsMultipleRange.fromString(selection);

    const selections: FlSheetSingleSelection[] = [];

    for (const range of ranges.ranges) {
      selections.push(new FlSheetSingleSelectionFull(sheet, range));
    }

    return new FlSheetMultiSelection(selections);
  }


  public addSelection(selection: FlSheetSingleSelection): void {
    this.selections.push(selection);
  }

  public addSelections(selections: FlSheetSingleSelection[]): void {
    this.selections.push(...selections);
  }


  public getCellsFlat(): FlCell[] {
    const cells: FlCell[] = [];
    for (const selection of this.selections) {
      cells.push(...selection.getCellsFlat());
    }
    return cells;
  }

  public getCellsValuesFlat(): any[] {
    return this.getCellsFlat().map(cell => cell.value);
  }

  /**
   * Split all the selection into multiple column selection and flatten the result
   */
  public splitToColumnSelections(): FlSheetSingleSelection[] {
    const columnSelection: FlSheetSingleSelection[] = [];
    this.selections.forEach(selection => columnSelection.push(...selection.splitToColumnSelections()));
    return columnSelection;
  }

  /**
   * Split all the selection into multiple column selection and flatten the result
   */
  public splitToRowSelections(): FlSheetSingleSelection[] {
    const columnSelection: FlSheetSingleSelection[] = [];
    this.selections.forEach(selection => columnSelection.push(...selection.splitToRowSelections()));
    return columnSelection;
  }

  // return all selection as text like B2:G5,B5:T4 (separated by ',')
  public toString(): string {
    const ranges = new FlCellsMultipleRange(this.selections.map(selection => selection.getRange()));

    return ranges.toString();
  }
}
