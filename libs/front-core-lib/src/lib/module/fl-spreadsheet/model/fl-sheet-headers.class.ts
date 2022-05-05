import {FlCell} from './fl-cell.class';
import {FlTagHelper, FlTagWithColor} from '../../fl-tag/fl-tag.class';
import {ClHelpService, ClStringHelper} from '@monorepo/core-lib';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';


export interface FlSheetHeader {
  index: number;
  name: string;
  tags: FlTagWithColor[];
}


export interface FlSheetRow extends FlSheetHeader {
  cells: FlCell[];
}

/**
 * Input object about row or column information
 */
export interface FlSheetHeaderInfoInput {
  name?: string;
  tags?: Record<string, string>;
}

/**
 * Information about a row or a column in the sheet
 */
export interface FlSheetHeaderInfo {
  name?: string;
  tags?: FlTagWithColor[];
}


/**
 * Class to manage columns or rows header infos
 */
export class FlSheetHeaders {

  private readonly _info: FlSheetHeaderInfoInput[];

  // object where the first key if the tag key, second is tag value and last value is tag color
  private tagColors: Record<string, Record<string, string>>;

  constructor(info: FlSheetHeaderInfoInput[] = []) {
    this._info = info;
    this.initTagsColors();
  }

  /**
   * Retrieve all the tags group by key
   */
  public getAllTags(): FlTagWithColor[] {
    const tags = this.groupTagByKeys();
    const tagsWithColors: FlTagWithColor[] = [];

    // build tags with colors using the tag colors object
    for (const key of Object.keys(tags)) {
      for (const tagValue of tags[key]) {
        tagsWithColors.push({
          key: key,
          value: tagValue,
          color: this.tagColors[key][tagValue]
        });
      }
    }

    return tagsWithColors;
  }

  public getInfo(index: number): FlSheetHeaderInfo {
    // if it doesn't exist, return a default value
    if (!this._info || this._info[index] == null) {
      return {name: '', tags: []};
    }
    const headerInfo = this._info[index];
    return {
      name: headerInfo.name,
      tags: this.convertTagsToTagsWithColors(headerInfo.tags)
    };
  }

  public hasInfo(index: number): boolean {
    const info = this.getInfo(index);
    return !ClHelpService.isNullOrEmpty(info.name) || !ClHelpService.isNullOrEmpty(info.tags);
  }

  public createInfo(index: number): void {
    if (this.info?.length > 0) {
      this.info.splice(index, 0, this.emptyInfo());
    }
  }

  public deleteInfo(from: number, deleteCount: number): void {
    if (this.info?.length > 0) {
      this.info.splice(from, deleteCount);
    }
  }

  get info(): FlSheetHeaderInfoInput[] {
    return this._info;
  }

  /**
   * Search the name in the header
   * @param name
   */
  public searchByName(name: string): string[] {
    if (!this._info) return [];
    const result = this._info
      .filter(info => info.name && ClStringHelper.stringContains(info.name, name))
      .map(info => info.name);
    return ClHelpService.sortAlphabeticalOrder(result);
  }

  /**
   * Get all the names from index with default to index if the name does not exist
   */
  public getNames(from: number, to: number): string[] {
    if (!this._info) return [];
    const names: string[] = [];
    for (let i = from; i <= to; i++) {
      names.push(this.getInfo(i).name ?? i.toString());
    }
    return names;
  }

  public findIndexByName(name: string): number {
    if (!this._info) return -1;
    return this._info.findIndex(info => info.name === name);
  }

  private emptyInfo(): FlSheetHeaderInfoInput {
    return {name: null, tags: {}};
  }

  private groupTagByKeys(): Record<string, string[]> {
    return FlTagHelper.groupTagsByKey(this.info.map(info => info.tags));
  }

  private initTagsColors(): void {
    const tags = this.groupTagByKeys();
    const tagColors = {};

    // set a color for each tag value based on index
    let colorIndex: number = 0;
    for (const key of Object.keys(tags)) {
      tagColors[key] = {};
      for (const tagValue of tags[key]) {
        tagColors[key][tagValue] = FlColorHelper.getColorFromIndex(colorIndex);
        colorIndex++;
      }
    }

    this.tagColors = tagColors;
  }

  private convertTagsToTagsWithColors(tags: Record<string, string>): FlTagWithColor[] {
    if (tags == null) return [];
    const tagsWithColors: FlTagWithColor[] = [];
    for (const key of Object.keys(tags)) {
      const value = tags[key];
      tagsWithColors.push({
        key: key,
        value: value,
        color: this.tagColors[key][value]
      });
    }
    return tagsWithColors;
  }

  public setTagColors(tagColors: FlTagWithColor[]): void {
    for (const tag of tagColors) {
      this.setTagColor(tag.key, tag.value, tag.color);
    }
  }

  public setTagColor(key: string, value: string, color: string): void {
    this.tagColors[key][value] = color;
  }

}
