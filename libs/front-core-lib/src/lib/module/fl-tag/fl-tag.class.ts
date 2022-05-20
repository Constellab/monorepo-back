import {Observable} from 'rxjs';
import {FlColorHelper} from '../../utils/fl-color-helper.class';

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

/**
 * Simple tag object with a color
 */
export interface FlTagWithColor {
  key: string;
  value: string;
  color: string;
}

/**
 * Event triggered when a tag is selected
 */
export interface FlTagSelectedEvent {
  tag: FlTag;
  event: MouseEvent;
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

  /**
   * Group a list of tag by keys
   * @param tagsList
   */
  public static groupTagsByKey(tagsList: Record<string, string>[]): Record<string, string[]> {
    const tags = {};

    if (tagsList) {
      for (const t of tagsList) {
        for (const key of Object.keys(t)) {
          if (tags[key] == null) {
            tags[key] = [];
          }
          if (tags[key].includes(t[key])) continue;

          tags[key].push(t[key]);
          tags[key] = tags[key].sort();
        }
      }
    }
    return tags;
  }

  /**
   * Convert tag groups to TagWith colors
   * @param tags
   * @param colors
   */
  public static tagGroupsToTagWithColors(tags: Record<string, string[]>, colors: string[]): FlTagWithColor[] {
    const tagsColors: FlTagWithColor[] = [];
    let i = 0;
    Object.keys(tags).forEach(tagKey => {
      // generate a color for each tag value
      tags[tagKey].forEach(tagValue => {
        tagsColors.push({
          key: tagKey,
          value: tagValue,
          color: colors[i % colors.length]
        });
        i++;
      });
    });
    return tagsColors;
  }

  public static getTagDefaultColor(key: string, value: string): string {
    return FlColorHelper.stringToRGBColor(`${key}${FlTagHelper.KEY_VALUE_SEPARATOR}${value}`);
  }
}

export abstract class FlTagService {
  public abstract searchTag(key: string): Observable<FlTagEntity[]>;
}
