import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FlChartRightSectionDirective} from '../fl-chart-right-section.directive';
import {FlChartSVGLegend} from '../../../model/legend/fl-chart-legend.class';
import {select} from 'd3';

/**
 * Component to render legend for heat map, it renders the legend in an svg
 */
@Component({
  selector: 'fl-chart-legend-heat-map',
  templateUrl: './fl-chart-legend-heat-map.component.html',
  styleUrls: ['./fl-chart-legend-heat-map.component.scss']
})
export class FlChartLegendHeatMapComponent extends FlChartRightSectionDirective<FlChartSVGLegend>
  implements OnInit {

  @ViewChild('svg', {static: true}) svg: ElementRef<HTMLElement>;

  ngOnInit(): void {
    const svgSelect = select<HTMLElement, void>(this.svg.nativeElement);
    this.data.renderLegend(svgSelect, this.svg.nativeElement.clientWidth,
      this.svg.nativeElement.clientHeight);

  }

}
