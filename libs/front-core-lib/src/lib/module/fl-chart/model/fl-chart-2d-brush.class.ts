import {BrushBehavior} from 'd3-brush';
import * as d3 from 'd3';
import {Selection} from 'd3-selection';
import {FlChartContainer2d} from './fl-chart-container.class';


export abstract class FlChartBrush {

  protected brush: BrushBehavior<any>;

  protected chart: FlChartContainer2d<any>;

  public brushContainer: Selection<any, any, null, null>;

  // todo replace with chart zoomable
  protected constructor(brush: BrushBehavior<any>,
                        chart: FlChartContainer2d<any>) {
    this.brush = brush;
    this.chart = chart;
    this.initBrush();
  }

  public abstract zoom(extent: any): void;

  public abstract resetZoom(): void;

  /**
   * Create the brush and listen to end and dblclick events
   * @private
   */
  private initBrush(): void {
    // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    this.brush.extent([[0, 0], [this.chart.chartWidth, this.chart.chartHeight]])

      // Each time the brush selection changes, trigger the 'updateChart' function
      .on('end', (event) => this.updateChart(event));

    // Add the brushing
    this.brushContainer = this.chart.chartContainer
      .append('g')
      .attr('class', 'brush')
      .call(this.brush);

    // listen to dblclick to reset zoom
    this.listenToDblClick();
  }

  // A function that update the chart for given boundaries
  private updateChart(event: any): any {
    // What are the selected boundaries?
    const extent: any = event.selection;

    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if (!extent) {
      return;
    }

    // This remove the grey brush area as soon as the selection has been done
    this.chart.chartContainer.select('.brush').call(this.brush.move, null);

    this.zoom(extent);
  }

  // If user double click, reinitialize the chart
  private listenToDblClick(): void {
    this.chart.group.on('dblclick', () => this.doubleClick());
  }

  private doubleClick(): void {
    this.resetZoom();
  }
}

export class FlChart2dBrush extends FlChartBrush {

  constructor(chart: FlChartContainer2d<any>) {
    super(d3.brush(), chart);
  }


  zoom(extent: number[][]): void {
    this.chart.zoom(extent[0][0], extent[1][0], extent[0][1], extent[1][1]);
  }

  resetZoom(): void {
    this.chart.resetZoom();
  }
}

export class FlChart2dBrushX extends FlChartBrush {

  constructor(chart: FlChartContainer2d<any>) {
    super(d3.brushX(), chart);
  }


  zoom(extent: number[]): void {
    this.chart.zoomX(extent[0], extent[1]);
  }

  resetZoom(): void {
    this.chart.resetZoomX();
  }
}

export class FlChart2dBrushY extends FlChartBrush {

  constructor(chart: FlChartContainer2d<any>) {
    super(d3.brushY(), chart);
  }


  zoom(extent: number[]): void {
    this.chart.zoomY(extent[0], extent[1]);
  }

  resetZoom(): void {
    this.chart.resetZoomY();
  }
}
