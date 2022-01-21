export interface SnElasticsearchResult<T = any> {
  hits: {
    total: { value: number, relation: string };
    hits: SnElasticsearchHit<T>[]
  };
}

export interface SnElasticsearchHit<T = any> {
  _score: number;
  _source: T;
  highlight: Record<keyof T, string[]>;
}
