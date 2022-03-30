import {Injectable} from '@angular/core';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FlTagWithColor} from '../../fl-tag/fl-tag.class';


@Injectable()
export class FlSpreadsheetTagsState {

  // store the selected row and column tags
  private selectedRowTags: BehaviorSubject<FlTagWithColor[]> = new BehaviorSubject([]);
  private selectedColumnTags: BehaviorSubject<FlTagWithColor[]> = new BehaviorSubject([]);

  constructor(private state: FlSpreadsheetState) {

  }

  public getRowColors$(rowId: number): Observable<string[]> {
    const sheet = this.state.currentSheet;
    return this.selectedRowTags.pipe(
      map(selectedTags => this.getSelectedHeaderTagColors(sheet.getRowInfo(rowId).tags, selectedTags))
    );
  }

  public getColumnColors$(columnId: number): Observable<string[]> {
    const sheet = this.state.currentSheet;
    return this.selectedRowTags.pipe(
      map(selectedTags => this.getSelectedHeaderTagColors(sheet.getColumnInfo(columnId).tags, selectedTags))
    );
  }

  /**
   * return the list of colors of the header tags that are selected
   */
  private getSelectedHeaderTagColors(headerTags: FlTagWithColor[], selectedTags: FlTagWithColor[]): string[] {
    const colors: string[] = [];

    for (const headerTag of headerTags) {
      // check if the tag is selected
      const selectedTag = selectedTags.find(tag => tag.key === headerTag.key && tag.value === headerTag.value);
      if (selectedTag) {
        colors.push(selectedTag.color);
      }
    }
    return colors;
  }

  public setSelectedRowTags(tagWithColors: FlTagWithColor[]): void {
    this.selectedRowTags.next(tagWithColors);
  }

  public setSelectedColumnTags(tagWithColors: FlTagWithColor[]): void {
    this.selectedColumnTags.next(tagWithColors);
  }
}
