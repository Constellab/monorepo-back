import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlSheetHeaderInfo} from '../../model/fl-sheet.class';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Portal to display information about a header (row or column)
 */
@Component({
  selector: 'fl-spreadsheet-header-info',
  templateUrl: './fl-spreadsheet-header-info.component.html',
  styleUrls: ['./fl-spreadsheet-header-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetHeaderInfoComponent implements OnInit {

  headerInfo: FlSheetHeaderInfo;

  constructor(@Inject(FL_PORTAL_DATA) headerInfo: FlSheetHeaderInfo) {
    this.headerInfo = headerInfo;
  }

  ngOnInit(): void {
  }

  hasTitle(): boolean {
    return this.headerInfo.name != null && this.headerInfo.name.toString().length > 0;
  }

  hasTags(): boolean {
    return !ClHelpService.isNullOrEmpty(this.headerInfo.tags);
  }

}
