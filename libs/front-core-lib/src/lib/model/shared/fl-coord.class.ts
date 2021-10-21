/**
 * Simple 2D coord object
 */
export interface FlCoord {
  x: number;
  y: number;
}


/**
 * Helper to manipulate coords
 */
export class FlCoordHelper {

  /**
   * Get the distance between a point a and segment (line)
   * code from : https://gist.github.com/mattdesl/47412d930dcd8cd765c871a65532ffac
   * @param point
   * @param segmentStart
   * @param segmentEnd
   */
  public static distToSegment(point: FlCoord, segmentStart: FlCoord, segmentEnd: FlCoord): number {
    return Math.sqrt(FlCoordHelper.distToSegmentSquared(point, segmentStart, segmentEnd));
  }

  private static distSquared(v: FlCoord, w: FlCoord): number {
    return Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
  }

  private static distToSegmentSquared(point: FlCoord, segmentStart: FlCoord, segmentEnd: FlCoord): number {
    const l2 = FlCoordHelper.distSquared(segmentStart, segmentEnd);
    if (l2 === 0) return FlCoordHelper.distSquared(point, segmentStart);
    let t = ((point.x - segmentStart.x) * (segmentEnd.x - segmentStart.x) +
      (point.y - segmentStart.y) * (segmentEnd.y - segmentStart.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return FlCoordHelper.distSquared(point, {
      x: segmentStart.x + t * (segmentEnd.x - segmentStart.x),
      y: segmentStart.y + t * (segmentEnd.y - segmentStart.y)
    });
  }
}
