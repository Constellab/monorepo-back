import {Component, OnInit} from '@angular/core';
import {FlChartSerieWithColor} from '../../../model/data/fl-chart-serie.class';
import {FlChartRightSectionDirective} from '../fl-chart-right-section.directive';
import {FlTagWithColor} from '../../../../fl-tag/fl-tag.class';
import {FlTagColorer} from '../../../../fl-tag/fl-tag-colorer.class';
import {Observable} from 'rxjs';

export interface FlChartLegendSerieWithTagsInput {
  legends: FlChartSerieWithColor[];
  tagColorer: FlTagColorer;
}

/**
 * Right section of the chart containing the legend (multi series) and a list of tag with selection
 * to change chart color
 */
@Component({
  selector: 'fl-chart-legend-series-with-tags',
  templateUrl: './fl-chart-legend-series-with-tags.component.html',
  styleUrls: ['./fl-chart-legend-series-with-tags.component.scss']
})
export class FlChartLegendSeriesWithTagsComponent extends FlChartRightSectionDirective<FlChartLegendSerieWithTagsInput>
  implements OnInit {

  tagAreSelected: boolean = false;

  hasTag$: Observable<boolean>;

  ngOnInit(): void {
    this.hasTag$ = this.data.tagColorer.hasTags$();
  }

  onTagColorChange(tags: FlTagWithColor[]): void {
    // this.data.tagColorer.setSelectedTags(tags);
    this.tagAreSelected = tags?.length > 0;
  }
}
