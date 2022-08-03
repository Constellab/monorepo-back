import {FlCell} from './fl-cell.class';
import {FlTagHelper, FlTagWithColor} from '../../fl-tag/fl-tag.class';
import {ClHelpService, ClStringHelper} from '@monorepo/core-lib';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';
import {FlTagColorer} from '../../fl-tag/fl-tag-colorer.class';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';


export interface FlSheetHeader {
  index: number;
  name: string;
  tags: Record<string, string>;
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
  tags?: Record<string, string>;
  tagColorer: FlTagColorer;
}


/**
 * Class to manage columns or rows header infos
 */
export class FlSheetHeaders {

  private readonly _info: FlSheetHeaderInfoInput[];

  public tagColorer: FlTagColorer;

  constructor(info: FlSheetHeaderInfoInput[] = []) {
    this._info = info;
    this.initTagsColors();
  }

  public getInfo(index: number): FlSheetHeaderInfo {
    // if it doesn't exist, return a default value
    if (!this._info || this._info[index] == null) {
      return {name: '', tags: {}, tagColorer: this.tagColorer};
    }
    const headerInfo = this._info[index];
    return {
      name: headerInfo.name,
      tags: headerInfo.tags,
      tagColorer: this.tagColorer
    };
  }

  /**
   * Set the header info from an index. It overwrites the existing info.
   * @param infos
   * @param fromIndex
   */
  public setInfoFromIndex(infos: FlSheetHeaderInfoInput[], fromIndex: number): void {
    for (let i = 0; i < infos.length; i++) {
      this._info[fromIndex + i] = infos[i];
    }

    // update the tag colors
    const groupedTags = FlTagHelper.groupTagsByKey(this.info.map(info => info.tags));
    this.tagColorer.addTags(groupedTags);
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
    this.tagColorer = FlTagColorer.fromGroupedTags(tags, FlColorHelper.getColorList());
  }

  public getSelectedIndexTagColors(index: number): Observable<string[]> {
    return this.tagColorer.getSelectedTags$().pipe(
      map(selectedTags => this.getHeaderColors(this.getInfo(index).tags, selectedTags))
    );
  }

  private getHeaderColors(headerTags: Record<string, string>, selectedTags: FlTagWithColor[]): string[] {
    const colors: string[] = [];

    for (const selectedTag of selectedTags) {
      if (headerTags[selectedTag.key] === selectedTag.value) {
        colors.push(selectedTag.color);
      }
    }
    return colors;
  }
}
