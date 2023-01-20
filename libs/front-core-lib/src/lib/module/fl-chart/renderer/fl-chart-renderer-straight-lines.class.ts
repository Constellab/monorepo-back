import {FlChart2AxisRenderer} from './fl-chart-renderer.class';
import {flD3DefaultTransitionDuration} from '../model/fl-d3.class';


export interface FlChartLine {
  orientation: 'vertical' | 'horizontal';
  position: number;
}

/**
 * Renderer to render simple straight lines.
 */
export class FlChartRendererStraightLines extends FlChart2AxisRenderer<any> {


  private readonly lineClassName: string = 'simple-line';

  constructor(private lines: FlChartLine[]) {
    super();
  }

  renderFirst(): void {
    this.draw(false);
  }

  refreshRender(): void {
    this.draw(true);
  }

  private draw(withTransition: boolean): void {
    const theme = this.getTheme();
    this.data.container
      .selectAll(`.${this.lineClassName}`)
      .data(this.lines)
      .join('line')
      .attr('class', this.lineClassName)
      .transition().duration(withTransition ? flD3DefaultTransitionDuration : 0)
      .attr('x1', d => d.orientation === 'vertical' ? this.data.xAxis.scale.scale(d.position) : 0)
      .attr('y1', d => d.orientation === 'horizontal' ? this.data.yAxis.scale.scale(d.position) : 0)
      .attr('x2', d => d.orientation === 'vertical' ? this.data.xAxis.scale.scale(d.position) : this.data.chartWidth)
      .attr('y2', d => d.orientation === 'horizontal' ? this.data.yAxis.scale.scale(d.position) : this.data.chartHeight)
      .attr('stroke', theme.cardBackground);

  }


}
