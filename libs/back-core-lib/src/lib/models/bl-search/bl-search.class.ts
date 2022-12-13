// to typescript
export type BlSearchOperatorStr = 'EQ' | 'NEQ' | 'LT' | 'LE' | 'GT' | 'GE'
  | 'CONTAINS' | 'IN' | 'NOT_IN' | 'NULL'
  | 'NOT_NULL' | 'START_WITH' | 'END_WITH' | 'MATCH' | 'BETWEEN';

export type BlSearchOrderStr = 'ASC' | 'DESC';

export type BlSearchOrderNullOption = 'LAST' | 'FIRST';

export interface BlSearchFilterCriteria {
  key: string;
  operator: BlSearchOperatorStr;
  value: any;
}

export interface BlSearchSortCriteria {
  key: string;
  order: BlSearchOrderStr;
  nullOption?: BlSearchOrderNullOption;
}

export interface BlSearchParams {
  filtersCriteria: BlSearchFilterCriteria[];
  sortsCriteria: BlSearchSortCriteria[];
}
