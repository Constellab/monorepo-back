import {FlChart2dDatumSerie, FlChart2dMultipleSerie, FlChart2dSerie} from './fl-chart-2d-data.class';
import {FlChart2d} from './fl-chart-2d.class';
import {FlChartScaleColor} from './fl-chart-scale-color.class';

export class FlChart2dScatterPlotMulti<Datum extends FlChart2dDatumSerie>
  extends FlChart2d<Datum> {

  public colorScale: FlChartScaleColor;

  protected dataContainer: FlChart2dMultipleSerie<Datum>;

  constructor(width: number, height: number) {
    super(width, height);
  }

  initData(data: FlChart2dMultipleSerie<Datum>): this {
    return super.initData(data);
  }

  protected addData(): void {
    // Add dots
    this.chartContainer
      // generate groups for the series
      .selectAll()
      .data(this.dataContainer.series)
      .enter()
      .append('g')

      // for each group, generate the circle
      .selectAll()
      .data((d) => d.getData())
      .enter()
      .append('circle')
      .attr('r', 1.5)
      .style('fill', '#69b3a2')
      .style('fill', (d: Datum) => this.colorScale.scale(d.getSerie()))
      .attr('cx', (d: Datum) => this.xScale.scale(d.getX()))
      .attr('cy', (d: Datum) => this.yScale.scale(d.getY()));
  }

  protected refreshData(): void {
    this.chartContainer
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: Datum) => this.xScale.scale(d.getX()))
      .attr('cy', (d: Datum) => this.yScale.scale(d.getY()));
  }

  public initColor(series: FlChart2dSerie<Datum>[]): this {
    this.colorScale = new FlChartScaleColor().domain(series.map(d => d.serie));
    return this;
  }
}
