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

export class BlSearchParams {

  filtersCriteria: BlSearchFilterCriteria[];

  sortsCriteria: BlSearchSortCriteria[];

  constructor(filtersCriteria: BlSearchFilterCriteria[] = [], sortsCriteria: BlSearchSortCriteria[] = []) {
    this.filtersCriteria = filtersCriteria;
    this.sortsCriteria = sortsCriteria;
  }

  public hasFilter(key: string): boolean {
    return this.filtersCriteria.some(filter => filter.key === key);
  }

  public removeFilter(key: string): void {
    this.filtersCriteria = this.filtersCriteria.filter(filter => filter.key !== key);
  }

  public getFilterValue(key: string): any | null {
    const filter = this.filtersCriteria.find(filter => filter.key === key);
    return filter?.value ?? null;
  }

  public clone(): BlSearchParams {
    return new BlSearchParams(this.filtersCriteria, this.sortsCriteria);
  }
}
