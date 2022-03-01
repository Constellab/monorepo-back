import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FlSpreadsheetRendererState} from '../../state/fl-spreadsheet-renderer-state.service';
import {flCdkOverlayContainerClass} from '../../../../utils/fl-material.config';
import {FlTagWithColor} from '../../../fl-tag/fl-tag.class';

@Component({
  selector: 'fl-spreadsheet-drawer',
  templateUrl: './fl-spreadsheet-drawer.component.html',
  styleUrls: ['./fl-spreadsheet-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetDrawerComponent implements OnInit {

  pinDrawer: boolean = false;

  columnTags$: Observable<Record<string, string[]>>;
  rowTags$: Observable<Record<string, string[]>>;

  // use to ignore the mouse event on the CDK to keep the drawer open if an overlay is opened
  cdkContainerClass: string = flCdkOverlayContainerClass;

  constructor(private drawer: MatDrawer,
              private tagState: FlSpreadsheetRendererState,
              private state: FlSpreadsheetState) {
  }

  ngOnInit(): void {
    this.columnTags$ = this.state.currentSheet$.pipe(
      map(sheet => sheet.getColumnsTags())
    );
    this.rowTags$ = this.state.currentSheet$.pipe(
      map(sheet => sheet.getRowsTags())
    );
  }

  updateRowTagColors(tags: FlTagWithColor[]): void {
    this.tagState.setRowTagColors(tags);
  }

  updateColumnTagColors(tags: FlTagWithColor[]): void {
    this.tagState.setColumnTagColors(tags);
  }

  closeDrawer(): void {
    this.drawer.close();
  }

}
