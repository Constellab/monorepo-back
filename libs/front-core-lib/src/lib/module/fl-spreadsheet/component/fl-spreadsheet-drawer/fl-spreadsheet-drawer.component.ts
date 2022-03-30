import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FlSpreadsheetTagsState} from '../../state/fl-spreadsheet-tags.state';
import {flCdkOverlayContainerClass} from '../../../../utils/fl-material.config';
import {FlTagWithColor} from '../../../fl-tag/fl-tag.class';
import {FlSheet} from '../../model/fl-sheet.class';

interface  FlSheetWithTags{
  sheet: FlSheet;
  tags: FlTagWithColor[];
}

@Component({
  selector: 'fl-spreadsheet-drawer',
  templateUrl: './fl-spreadsheet-drawer.component.html',
  styleUrls: ['./fl-spreadsheet-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetDrawerComponent implements OnInit {

  pinDrawer: boolean = false;

  currentSheet$: Observable<FlSheet>;
  columnTags$: Observable<FlSheetWithTags>;
  rowTags$: Observable<FlSheetWithTags>;

  // use to ignore the mouse event on the CDK to keep the drawer open if an overlay is opened
  cdkContainerClass: string = flCdkOverlayContainerClass;

  constructor(private drawer: MatDrawer,
              private tagState: FlSpreadsheetTagsState,
              private state: FlSpreadsheetState) {
  }

  ngOnInit(): void {
    this.currentSheet$ = this.state.currentSheet$;
    this.columnTags$ = this.state.currentSheet$.pipe(
      map(sheet => ({sheet: sheet, tags: sheet.getColumnsTags()}))
    );
    this.rowTags$ = this.state.currentSheet$.pipe(
      map(sheet => ({sheet: sheet, tags: sheet.getRowsTags()}))
    );
  }

  updateRowTagColors(tags: FlTagWithColor[], sheet: FlSheet): void {
    sheet.rows.setTagColors(tags);
    this.tagState.setSelectedRowTags(tags);
  }

  updateColumnTagColors(tags: FlTagWithColor[], sheet: FlSheet): void {
    sheet.columns.setTagColors(tags);
    this.tagState.setSelectedColumnTags(tags);
  }

  closeDrawer(): void {
    this.drawer.close();
  }

}
