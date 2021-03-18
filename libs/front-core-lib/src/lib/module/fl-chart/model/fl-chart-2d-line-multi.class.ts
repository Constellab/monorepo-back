import {FlChart2dDatum, FlChart2dDatumSerie, FlChart2dMultipleSerie, FlChart2dSerie} from './fl-chart-2d-data.class';
import * as d3 from 'd3';
import {FlChart2d} from './fl-chart-2d.class';
import {FlChartScaleColor} from './fl-chart-scale-color.class';


/**
 * Class to manage line chart with multiple series
 */
export class FlChart2dLineMulti<Datum extends FlChart2dDatumSerie>
  extends FlChart2d<Datum> {

  private readonly serieClassName: string = 'serie';

  public colorScale: FlChartScaleColor;

  protected dataContainer: FlChart2dMultipleSerie<Datum>;

  constructor(width: number, height: number) {
    super(width, height);
  }

  initData(data: FlChart2dMultipleSerie<Datum>): this {
    return super.initData(data);
  }

  protected addData(): void {
    // Add the line
    this.chartContainer
      .selectAll()
      .data(this.dataContainer.series)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', serie => this.colorScale.scale(serie.serie))
      .attr('class', this.serieClassName)  // I add the class line to be able to modify this line later on.
      .attr('stroke-width', 1.5)
      .attr('d', (d: FlChart2dSerie<Datum>) => d3.line<FlChart2dDatum>()
        .x((d: FlChart2dDatum) => this.xScale.scale(d.getX()))
        .y((d: FlChart2dDatum) => this.yScale.scale(d.getY()))
        (d.getData()) // use to loop through serie's data
      );
  }

  protected refreshData(): void {
    this.chartContainer
      .selectAll(`.${this.serieClassName}`)
      .transition()
      .attr('d', (d: FlChart2dSerie<Datum>) => d3.line<FlChart2dDatum>()
        .x((d: FlChart2dDatum) => this.xScale.scale(d.getX()))
        .y((d: FlChart2dDatum) => this.yScale.scale(d.getY()))
        (d.getData()) // use to loop through serie's data
      );
  }


  public initColor(series: FlChart2dSerie<Datum>[]): this {
    this.colorScale = new FlChartScaleColor().domain(series.map(d => d.serie));
    return this;
  }
}

