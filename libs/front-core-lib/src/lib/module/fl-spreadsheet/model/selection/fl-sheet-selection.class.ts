import {FlCell} from '../fl-cell.class';

/**
 * Interface representing a selection, this can be a single or a multiple selection
 */
export interface FlSheetSelection {

  getCellsFlat(): FlCell[];

  getCellsValuesFlat(): any[];

  toString(): string;
}
