import {Injectable} from '@angular/core';
import {FlCoord} from '../../../model/shared/fl-coord.class';

@Injectable()
export class FlBioNetworkGridTwoState {
  public static readonly gridStep: number = 20;
  public static readonly gridSize: number = 15000;

  // threshold when rounding a position to the grid
  private gridRoundPosThreshold: number = 0.15;

  /**
   * round coord based on the grid. return null if the coord are too far to be rounded
   * @param coord
   */
  public roundCoordOnGrid(coord: FlCoord): FlCoord | null {
    const roundedX: number = this.roundToAxisTick(coord.x);
    // if the x can't be rounded
    if (roundedX == null) {
      return null;
    }

    const roundedY: number = this.roundToAxisTick(coord.y);
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
   * @private
   */
  private roundToAxisTick(position: number): number | null {


    // get diff between left tick and position
    const firstDiff = Math.abs(position % FlBioNetworkGridTwoState.gridStep);
    // retrieve the tick index
    const tickIndex: number = Math.trunc(position / FlBioNetworkGridTwoState.gridStep);

    // it needs a diff of 15% or less than the tick size to automatically round the position
    if (firstDiff / FlBioNetworkGridTwoState.gridStep < this.gridRoundPosThreshold) {
      // convert tick index to position
      return tickIndex * FlBioNetworkGridTwoState.gridStep;
    }

    // check the next tick
    const secondDiff = Math.abs(FlBioNetworkGridTwoState.gridStep - firstDiff);
    if (secondDiff / FlBioNetworkGridTwoState.gridStep < this.gridRoundPosThreshold) {
      // if the index is negative of -0, set descrese tickIndex, otherwise increase it
      const nextTick = tickIndex < 0 || Object.is(tickIndex, -0) ? -1 : +1;
      // convert tick index to position
      return (tickIndex + nextTick) * FlBioNetworkGridTwoState.gridStep;
    }

    return null;
  }

}
