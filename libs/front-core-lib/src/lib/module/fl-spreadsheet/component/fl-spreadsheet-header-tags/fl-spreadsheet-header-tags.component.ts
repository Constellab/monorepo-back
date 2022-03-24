import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ClHelpService} from '@monorepo/core-lib';

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

  @Input() tags: Record<string, string>;

  constructor() {
  }

  ngOnInit(): void {
  }

  hasTags(): boolean {
    return !ClHelpService.isNullOrEmpty(this.tags);
  }
}
