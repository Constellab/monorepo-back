

export interface ObjectNode {
  id: number;
  children?: ObjectNode[];
  key: string;
  value?: any;
  type: string;
  preview ?: string;
}

export interface ObjectFlatNode {
  id: number;
  expandable: boolean;
  level: number;
  key: string;
  value?: any;
  type: string;
  preview?: string;
}
