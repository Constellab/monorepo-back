export type FlObjectNodeType = 'null' | 'object' | 'array' | 'boolean' | 'number' | 'string';

export interface FlObjectNode {
  id: number;
  children?: FlObjectNode[];
  key: string;
  value?: any;
  type: FlObjectNodeType;
  preview?: string;
}

export interface FlObjectFlatNode {
  id: number;
  expandable: boolean;
  level: number;
  key: string;
  value?: any;
  type: FlObjectNodeType;
  preview?: string;
  className:string;
}
