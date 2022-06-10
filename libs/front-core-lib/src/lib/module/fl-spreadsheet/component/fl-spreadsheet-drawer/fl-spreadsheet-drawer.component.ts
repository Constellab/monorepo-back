import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {flCdkOverlayContainerClass} from '../../../../utils/fl-material.config';
import {FlSheet} from '../../model/fl-sheet.class';
import {FlTagColorer} from '../../../fl-tag/fl-tag-colorer.class';

@Component({
  selector: 'fl-spreadsheet-drawer',
  templateUrl: './fl-spreadsheet-drawer.component.html',
  styleUrls: ['./fl-spreadsheet-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetDrawerComponent implements OnInit {

  pinDrawer: boolean = false;

  currentSheet$: Observable<FlSheet>;

  columnTagsColorer$: Observable<FlTagColorer>;
  rowTagsColorer$: Observable<FlTagColorer>;

  // use to ignore the mouse event on the CDK to keep the drawer open if an overlay is opened
  cdkContainerClass: string = flCdkOverlayContainerClass;

  constructor(private drawer: MatDrawer,
              private state: FlSpreadsheetState) {
  }

  ngOnInit(): void {
    this.currentSheet$ = this.state.currentSheet$;
    this.columnTagsColorer$ = this.state.currentSheet$.pipe(
      map(sheet => sheet.columns.tagColorer)
    );

    this.rowTagsColorer$ = this.state.currentSheet$.pipe(
      map(sheet => sheet.rows.tagColorer)
    );
  }


  closeDrawer(): void {
    this.drawer.close();
  }

}
