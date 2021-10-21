import {Injectable} from '@angular/core';
import * as d3 from 'd3';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlCoord} from '../../../model/shared/fl-coord.class';

interface AxisTick {
  start: number;
  size: number;
}

/**
 * State to draw and manage the grid in the BioNetwork
 */
@Injectable()
export class FlBioNetworkGridState {

  private xAxis: FlD3SelectionSimple;
  private yAxis: FlD3SelectionSimple;

  public xAxisTick: AxisTick;
  public yAxisTick: AxisTick;

  // threshold when rounding a position to the grid
  private gridRoundPosThreshold: number = 0.15;
  private gridSize: number = 15000;

  constructor() {
  }

  // draw the grid
  public initGrid(axisGroup: FlD3SelectionSimple): void {
    const xScale = d3.scaleLinear()
      .domain([-this.gridSize / 2, this.gridSize / 2])
      .range([0, this.gridSize]);

    const yScale = d3.scaleLinear()
      .domain([-this.gridSize / 2, this.gridSize / 2])
      .range([this.gridSize, 0]);
    const gridXAxis = d3.axisBottom(xScale)
      .ticks(this.gridSize / 20)
      .tickFormat(() => '')
      .tickSize(this.gridSize);
    const gridYAxis = d3.axisRight(yScale)
      .ticks(this.gridSize / 20)
      .tickFormat(() => '')
      .tickSize(this.gridSize);


    const translate = `translate(-${this.gridSize / 2}, -${this.gridSize / 2})`;
    axisGroup.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', translate)
      .call(gridXAxis);
    axisGroup.append('g')
      .attr('class', 'axis axis-y')
      .attr('transform', translate)
      .call(gridYAxis);

    this.xAxis = axisGroup.select('.axis-x');
    this.yAxis = axisGroup.select('.axis-y');

    this.xAxisTick = this.getAxisTickInformation('x');
    this.yAxisTick = this.getAxisTickInformation('y');
  }

  /**
   * round coord based on the grid. return null if the coord are too far to be rounded
   * @param coord
   */
  public roundCoordOnGrid(coord: FlCoord): FlCoord | null {
    const roundedX: number = this.roundToAxisTick(coord.x, 'x');
    // if the x can't be rounded
    if (roundedX == null) {
      return null;
    }

    const roundedY: number = this.roundToAxisTick(coord.y, 'y');
    // f the y can't be rounded
    if (roundedY == null) {
      return null;
    }

    // return rounded position
    return {
      x: roundedX, y: roundedY
    };
  }

  /**
   * Round a position on an axis. Return null if the position is not close enough to be rounded
   * @param position position to round
   * @param axis
   * @private
   */
  private roundToAxisTick(position: number, axis: 'x' | 'y'): number | null {
    const tickInfo: AxisTick = axis === 'x' ? this.xAxisTick : this.yAxisTick;


    // get diff between left tick and position
    const firstDiff = Math.abs((position - tickInfo.start) % tickInfo.size);
    // retrieve the tick index
    const tickIndex: number = Math.trunc((position - tickInfo.start) / tickInfo.size);

    // it needs a diff of 15% or less than the tick size to automatically round the position
    if (firstDiff / tickInfo.size < this.gridRoundPosThreshold) {
      // convert tick index to position
      return tickIndex * tickInfo.size + tickInfo.start;
    }

    // check the next tick
    const secondDiff = Math.abs(tickInfo.size - firstDiff);
    if (secondDiff / tickInfo.size < this.gridRoundPosThreshold) {
      const nextTick = tickIndex < 0 ? -1 : +1;
      // convert tick index to position
      return (tickIndex + nextTick) * tickInfo.size + tickInfo.start;
    }

    return null;
  }

  // return tick size and first tick pos for an axis
  private getAxisTickInformation(axis: 'x' | 'y'): AxisTick {
    const axisSelection = axis === 'x' ? this.xAxis : this.yAxis;

    const ticks = axisSelection.selectAll('.tick').nodes();
    const firstTick = axis === 'x' ? ticks[0] : ticks[ticks.length - 1];
    const secondTick = axis === 'x' ? ticks[1] : ticks[ticks.length - 2];

    const firstCoord: FlCoord = this.getTickCoords(firstTick);
    const secondCoord: FlCoord = this.getTickCoords(secondTick);

    const firstPos: number = axis === 'x' ? firstCoord.x : firstCoord.y;
    const secondPos: number = axis === 'x' ? secondCoord.x : secondCoord.y;

    return {
      start: firstPos,
      size: Math.abs(firstPos - secondPos)
    };
  }

  private getTickCoords(tick: any): FlCoord {
    const tickSelection = d3.select(tick);
    // get transform like translate(x,y)
    const translate = tickSelection.attr('transform');
    return this.coordFromTransform(translate);
  }

  // convert transform info to coord
  private coordFromTransform(transform: string): FlCoord {
    const coord: string[] = transform.substring(transform.indexOf('(') + 1, transform.indexOf(')')).split(',');
    return {
      x: parseFloat(coord[0]),
      y: parseFloat(coord[1])
    };
  }
}
