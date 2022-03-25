import {FlCell} from './fl-cell.class';
import {FlTagHelper, FlTagWithColor} from '../../fl-tag/fl-tag.class';
import {ClHelpService, ClStringHelper} from '@monorepo/core-lib';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';


export interface FlSheetHeader {
  index: number;
  name: string;
  tags: Record<string, string>;
}


export interface FlSheetRow extends FlSheetHeader {
  cells: FlCell[];
}

/**
 * Information about a row or a column in the sheet
 */
export interface FlSheetHeaderInfo {
  name?: string;
  tags?: Record<string, string>;
}


/**
 * Class to manage columns or rows header infos
 */
export class FlSheetHeaders {

  private readonly _info: FlSheetHeaderInfo[];

  // object where the first key if the tag key, second is tag value and last value is tag color
  private tagColors: Record<string, Record<string, string>>;

  constructor(info: FlSheetHeaderInfo[] = []) {
    this._info = info;
    this.setTagsColors();
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
      return this.emptyInfo();
    }
    return this._info[index];
  }

  public hasInfo(index: number): boolean {
    const info = this.getInfo(index);
    return ClHelpService.isNullOrEmpty(info.name) && ClHelpService.isNullOrEmpty(info.tags);
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

  get info(): FlSheetHeaderInfo[] {
    return this._info;
  }

  /**
   * Search the name in the header
   * @param name
   */
  public searchName(name: string): string[] {
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

  private emptyInfo(): FlSheetHeaderInfo {
    return {name: null, tags: {}};
  }

  private groupTagByKeys(): Record<string, string[]> {
    return FlTagHelper.groupTagsByKey(this.info.map(info => info.tags));
  }

  private setTagsColors(): void {
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

}
