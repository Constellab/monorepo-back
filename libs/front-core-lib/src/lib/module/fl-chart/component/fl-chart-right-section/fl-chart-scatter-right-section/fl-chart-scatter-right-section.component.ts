import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlChartRightSectionDirective} from '../fl-chart-right-section.directive';
import {FlTagHelper, FlTagWithColor} from '../../../../fl-tag/fl-tag.class';
import {FlColorHelper} from '../../../../../utils/fl-color-helper.class';
import {FlChartScaleColorTag} from '../../../model/scale/fl-chart-scale-color.class';
import {FlChartSerieWithColor} from '../../../model/data/fl-chart-serie.class';
import {FlChartRendererScatterPlot} from '../../../renderer/fl-chart-renderer-scatter.plot';

export interface FlChartScatterPlotLegendData {
  legends: FlChartSerieWithColor[];
  scatterRenderer: FlChartRendererScatterPlot;
  tags: Record<string, string[]>;
}

/**
 * Right section of the chart for the scatter plot. It includes the legend and
 * list of tags to change colors
 */
@Component({
  selector: 'fl-chart-scatter-right-section',
  templateUrl: './fl-chart-scatter-right-section.component.html',
  styleUrls: ['./fl-chart-scatter-right-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlChartScatterRightSectionComponent extends FlChartRightSectionDirective<FlChartScatterPlotLegendData>
  implements OnInit {

  tags: FlTagWithColor[];

  tagAreSelected: boolean= false;

  ngOnInit(): void {
    this.tags = FlTagHelper.tagGroupsToTagWithColors(this.data.tags,
      FlColorHelper.getColorTransparentList());
  }

  onColorChange(tags: FlTagWithColor[]): void {
    if(tags?.length > 0){
      const colorScale = new FlChartScaleColorTag(tags);
      this.data.scatterRenderer.setTagColors(colorScale);
      this.tagAreSelected = true;
    }
    else{
      this.data.scatterRenderer.resetColors();
      this.tagAreSelected = false;
    }
  }

  hasTags(): boolean{
    return this.tags?.length > 0;
  }
}
