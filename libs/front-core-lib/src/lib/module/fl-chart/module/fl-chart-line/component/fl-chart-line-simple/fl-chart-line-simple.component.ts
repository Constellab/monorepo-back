import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {Numeric, ScaleTime} from 'd3';
import {Selection} from 'd3-selection';
import {FlChart2d} from '../../../../model/fl-chart-2d.class';
import {FlChartAxisScale, FlChartAxisScaleDate, FlChartAxisScaleNumber} from '../../../../model/fl-chart-scale.class';
import {FlChart2dLine} from '../../../../model/fl-chart-2d-line.class';
import {FlChart2dData, FlChart2dDataContainer, FlChart2dDatum} from '../../../../model/fl-chart-2d-data.class';
import {FlChart2dBrushX, FlChartBrush} from '../../../../model/fl-chart-2d-brush.class';

class Data implements FlChart2dDatum {
  constructor(private date: Date,
              private value: number) {
  }

  getX(): Date {
    return this.date;
  }

  getY(): number {
    return this.value;
  }
}

@Component({
  selector: 'fl-chart-line-simple',
  templateUrl: './fl-chart-line-simple.component.html',
  styleUrls: ['./fl-chart-line-simple.component.scss']
})
export class FlChartLineSimpleComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  chart: FlChart2d<Data>;


  focus: Selection<Element, void, null, undefined>;

  focusText: Selection<Element, void, null, undefined>;

  bisect: any;

  x: ScaleTime<number, number>;

  data: FlChart2dDataContainer<Data>;


  brush: FlChartBrush;

  hover: any;

  constructor() {
  }

  ngOnInit(): void {
    this.loadData();
  }


  private loadData(): void {
    //Read the data
    d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv',
      // When reading the csv, I must format variables:
      // ((d: any) => ({date: d3.timeParse('%Y-%m-%d')(d.date), value: d.value})) as any,

      // Now I can use this dataset:
      data => this.onCSVLoad(data))
      .then(data => this.onLoadSuccess(data));
  }

  private onCSVLoad(data: any): Data {
    return new Data(d3.timeParse('%Y-%m-%d')(data.date), parseInt(data.value));
  }

  private onLoadSuccess(data: Data[]): void {
    this.data = new FlChart2dData(data);

    const chart: FlChart2d<Data> = new FlChart2dLine<Data>(460, 400);

    const xScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleDate()
      .domain(this.data.getExtentX())
      .range(chart.getRangeX());

    const yScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.data.getExtentY())
      .range(chart.getRangeY());

    chart.initSvg(this.chartHtmlContainer.nativeElement)
      .initX(xScale)
      .initY(yScale)
      .initData(this.data);

    this.chart = chart;

    // this.initSVG();
    // this.initX();
    // this.initY();
    // this.initData();
    this.initBrush();
    // this.initDataView();
    // this.focus.selectAll().data()
  }

  // private initSVG(): void {
  //   // append the svg object to the body of the page
  //   this.svg = d3.select<HTMLElement, void>(this.chart.nativeElement)
  //     .append('svg')
  //     .attr('width', width + margin.left + margin.right)
  //     .attr('height', height + margin.top + margin.bottom)
  //     .append('g')
  //     .attr('transform',
  //       'translate(' + margin.left + ',' + margin.top + ')');
  //
  //   this.line = this.svg.append('g')
  //     .attr('clip-path', 'url(#clip)') as any;  // prevent line to overflow
  //
  //   // Add a clipPath: everything out of this area won't be drawn.
  //   this.svg.append('defs').append('svg:clipPath')
  //     .attr('id', 'clip')
  //     .append('svg:rect')
  //     .attr('width', width)
  //     .attr('height', height)
  //     .attr('x', 0)
  //     .attr('y', 0);
  // }

  //
  // private initX(): void {
  //   // Add X axis --> it is a date format
  //   this.x = d3.scaleTime()
  //     .domain(d3.extent<Data, Date>(this.data, d => d.date))
  //     .range([0, width]);
  //
  //   this.xAxis = this.svg.append('g')
  //     .attr('transform', 'translate(0,' + height + ')')
  //     .call(d3.axisBottom(this.x));
  // }
  //
  // private initY(): void {
  //   // Add Y axis
  //   this.y = d3.scaleLinear()
  //     .domain([0, d3.max(this.data, d => +d.value)])
  //     .range([height, 0]);
  //
  //
  //   this.svg.append('g')
  //     .call(d3.axisLeft(this.y));
  // }

  // private initDataView(): void {
  //   // This allows to find the closest X index of the mouse:
  //   this.bisect = d3.bisector((d: Data) => d.date).left;
  //
  //   // Create the circle that travels along the curve of chart
  //   this.focus = this.svg
  //     .append('g')
  //     .append('circle')
  //     .style('fill', 'none')
  //     .attr('stroke', 'black')
  //     .attr('r', 8.5)
  //     .style('opacity', 0);
  //
  //   // Create the text that travels along the curve of chart
  //   this.focusText = this.svg
  //     .append('g')
  //     .append('text')
  //     .style('opacity', 0)
  //     .attr('text-anchor', 'left')
  //     .attr('alignment-baseline', 'middle');
  //
  //
  //   // Create a rect on top of the svg area: this rectangle recovers mouse position
  //   this.line
  //     .select('.brush')
  //     // .append('rect')
  //     // .attr('id', 'mouse-listener')
  //     .style('fill', 'none')
  //     .style('pointer-events', 'all')
  //     .attr('width', width)
  //     .attr('height', height)
  //     .on('mouseover', () => this.mouseover())
  //     .on('mousemove', (element) => this.mousemove(element))
  //     .on('mouseout', () => this.mouseout());
  // }

  private initBrush(): void {
    this.brush = new FlChart2dBrushX(this.chart);
  }


  private initData(): void {
    //
    // // Add the line
    // this.line.append('path')
    //   .datum(this.data)
    //   .attr('fill', 'none')
    //   .attr('class', 'line')  // I add the class line to be able to modify this line later on.
    //   .attr('stroke', 'steelblue')
    //   .attr('stroke-width', 1.5)
    //   .attr('d', d3.line<Data>()
    //     .x((d: Data) => this.x(d.date))
    //     .y((d: Data) => this.y(d.value))
    //   );

  }

  // What happens when the mouse move -> show the annotations at the right positions.
  private mouseover(): void {
    // this.focus.style('opacity', 1);
    // this.focusText.style('opacity', 1);
  }

  private mousemove(element: any): void {
    // // recover coordinate we need
    // const x0 = this.x.invert(d3.pointer(element)[0]);
    // const i = this.bisect(this.data, x0, 1);
    // const selectedData = this.data[i];
    // this.focus
    //   .attr('cx', this.x(selectedData.date))
    //   .attr('cy', this.y(selectedData.value));
    //
    // this.hover = selectedData.date.toString();
    // this.focusText
    //   .html('x:' + selectedData.date + '  -  ' + 'y:' + selectedData.value)
    //   .attr('x', this.x(selectedData.date) + 15)
    //   .attr('y', this.y(selectedData.value));
    // // .attr('fill', 'white');
  }

  private mouseout(): void {
    // this.focus.style('opacity', 0);
    // this.focusText.style('opacity', 0);
  }

}
