import {FlCell} from './fl-cell.class';

export interface FlSheetHeader {
  index: number;
  name: string;
  tags: Record<string, string>;
}


export interface FlSheetRow extends FlSheetHeader{
  cells: FlCell[];
}

