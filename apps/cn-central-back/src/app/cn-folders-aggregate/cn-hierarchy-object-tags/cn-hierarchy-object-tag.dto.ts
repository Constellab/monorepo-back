export interface CnTag {
  key: string;
  value: string;
}

export class CnTagList {
  constructor(public tags: CnTag[]) {}

  public hasTag(tag: CnTag): boolean {
    return this.tags.some((t) => t.key === tag.key && t.value === tag.value);
  }
}

export interface CnTagKey {
  key: string;
  values: string[];
}

export interface CnAvailableTags {
  tags: CnTagKey[];
}
