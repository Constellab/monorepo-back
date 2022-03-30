import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ClHelpService} from '@monorepo/core-lib';
import {FlTagWithColor} from '../../../fl-tag/fl-tag.class';

/**
 * List the tags of a header
 */
@Component({
  selector: 'fl-spreadsheet-header-tags',
  templateUrl: './fl-spreadsheet-header-tags.component.html',
  styleUrls: ['./fl-spreadsheet-header-tags.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetHeaderTagsComponent implements OnInit {

  @Input() tags: FlTagWithColor[];

  constructor() {
  }

  ngOnInit(): void {
  }

  hasTags(): boolean {
    return !ClHelpService.isNullOrEmpty(this.tags);
  }
}
