import {Observable} from 'rxjs';

/**
 * Simple tag with key value
 */
export interface FlTag {
  key: string;
  value: string;
}

/**
 * Tag information that contains the list of available values for a tag
 */
export interface FlTagEntity {
  key: string;
  values: string[];
}


export class FlTagHelper {

  public static addOrReplaceTag(tags: FlTag[], tag: FlTag): FlTag[] {
    if (!tags) return [tag];

    const existingTag: number = tags.findIndex(t => t.key === tag.key);
    if (existingTag >= 0) {
      const newTags = [...tags];
      newTags[existingTag] = tag;
      return newTags;
    } else {
      return [...tags, tag];
    }
  }
}

export abstract class FlTagService {
  public abstract searchTag(key: string): Observable<FlTagEntity[]>;
}
