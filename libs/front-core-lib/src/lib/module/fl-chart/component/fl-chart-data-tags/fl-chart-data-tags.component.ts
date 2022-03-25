import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ClHelpService} from '@monorepo/core-lib';

@Component({
  selector: 'fl-chart-data-tags',
  templateUrl: './fl-chart-data-tags.component.html',
  styleUrls: ['./fl-chart-data-tags.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlChartDataTagsComponent implements OnInit {

  @Input() tags?: Record<string, string>;


  constructor() {
  }

  ngOnInit(): void {
  }

  hasTag(): boolean {
    return !ClHelpService.isEmptyObject(this.tags);
  }

}
