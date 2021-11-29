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

  private static readonly KEY_VALUE_SEPARATOR = ':';
  private static readonly TAGS_SEPARATOR = ',';

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

  public static tagsToString(tags: FlTag[]): string {
    if (!tags) return null;

    let strTag = '';
    for (const tag of tags) {
      if (strTag.length > 0) {
        strTag += FlTagHelper.TAGS_SEPARATOR;
      }

      strTag += FlTagHelper.tagToString(tag);
    }

    return strTag;
  }

  public static tagToString(tag: FlTag): string {
    if (!tag) return null;

    return `${tag.key}${FlTagHelper.KEY_VALUE_SEPARATOR}${tag.value}`;
  }
}

export abstract class FlTagService {
  public abstract searchTag(key: string): Observable<FlTagEntity[]>;
}
