import {curveCatmullRom, line, select, SimulationLinkDatum} from 'd3';
import {FlBioNetworkMetaboliteLevel, FlBioNetworkReactionEstimate} from './fl-bio-network.class';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlBioNetworkD3Cofactor} from './fl-bio-network-d3-cofactor.class';
import {FlBioNetworkD3Reaction} from './fl-bio-network-d3-reaction.class';
import {FlBioNetworkD3Object} from './fl-bio-network-d3.class';
import {FlCoord, FlCoordHelper} from '../../../model/shared/fl-coord.class';

export const flBioNetworkLinkElement = 'path';

// const lineFunction = line<FlCoord>().x(d => d.x).y(d => d.y);
// const lineFunction = line<FlCoord>().x(d => d.x).y(d => d.y).curve(curveStep);
const lineFunction = line<FlCoord>().x(d => d.x).y(d => d.y).curve(curveCatmullRom.alpha(1));

export class FlBioNetworkD3LinkPoint implements FlCoord {
  private static id: number = 0;

  id: number;

  constructor(public x: number, public y: number, public link: FlBioNetworkD3Link) {
    this.id = FlBioNetworkD3LinkPoint.id++;
  }

  public setCoord(coord: FlCoord): void {
    this.x = coord.x;
    this.y = coord.y;
    this.link.savePoints();
  }

  public toCoord(): FlCoord {
    return {
      x: this.x,
      y: this.y
    };
  }

  public delete(): void {
    this.link.deletePoint(this.id);
  }
}


export class FlBioNetworkD3Link extends FlBioNetworkD3Object
  implements SimulationLinkDatum<FlBioNetworkD3Node> {

  private static id: number = 0;

  id: number;

  source: FlBioNetworkD3Node;
  target: FlBioNetworkD3Node;

  pointPositions: FlBioNetworkD3LinkPoint[] = [];

  // group element containing the link (path) and the points (circles)
  groupElement: SVGGElement;

  value: number;
  absValue: number;

  constructor(source: FlBioNetworkD3Node, target: FlBioNetworkD3Node,
              public estimate: FlBioNetworkReactionEstimate, points: FlCoord[],
              public defaultColor: string) {
    super();
    this.source = source;
    this.target = target;
    this.id = FlBioNetworkD3Link.id++;

    // init each points
    if (points) {
      points.forEach(point => this.pointPositions.push(new FlBioNetworkD3LinkPoint(point.x, point.y, this)));
    }

    // add the link to the source and target
    this.source.departureLinks.push(this);
    this.target.arrivalLinks.push(this);

    this.value = typeof this.estimate.value === 'number' ? this.estimate.value : 0;
    this.absValue = Math.abs(this.value);
  }

  get absLog2Value(): number {
    return Math.log2(this.absValue + 1.5);
  }

  get log2Value(): number {
    return this.value > 0 ? this.absLog2Value : -this.absLog2Value;
  }

  get absLog10Value(): number {
    return Math.log10(this.absValue + 1.5);
  }

  ////////////////////////////////////// NODES //////////////////////////////////////

  isLinkedToNode(nodeId: number): boolean {
    return this.source.id === nodeId || this.target.id === nodeId;
  }

  isLinkedToAnyNode(nodeIds: number[]): boolean {
    return nodeIds.some(nodeIndex => this.isLinkedToNode(nodeIndex));
  }

  // return true if the link is linked to a cofactor
  isLinkedToCofactor(): boolean {
    return this.source instanceof FlBioNetworkD3Cofactor || this.target instanceof FlBioNetworkD3Cofactor;
  }

  // todo to remove
  getLinkWidth(): number {
    const level = this.getLevel();
    switch (level) {
      case FlBioNetworkMetaboliteLevel.MAJOR:
        return this.absLog10Value + 3;
      case FlBioNetworkMetaboliteLevel.MINOR:
        return this.absLog10Value + 1;
      case FlBioNetworkMetaboliteLevel.COFACTOR:
        return Math.max(this.absLog10Value, 1);
    }
  }

  ////////////////////////////////////// POINTS //////////////////////////////////////
  public getPathAttr(): string {
    if (!this.source.hasPositions() || !this.target.hasPositions()) return null;
    return lineFunction(this.getPathPoints());
  }

  public getPathPoints(): FlCoord[] {
    const startCoord: FlCoord = this.source.getCenter();
    const endCoord: FlCoord = this.target.getCenter();
    return [startCoord, ...this.pointPositions, endCoord];
  }


  /**
   * Insert a new point in the points. It calculates where to insert the points
   * @param coord
   */
  public insertPoint(coord: FlCoord): void {
    const point: FlBioNetworkD3LinkPoint = new FlBioNetworkD3LinkPoint(coord.x, coord.y, this);

    if (this.pointPositions.length === 0) {
      this.pointPositions.push(point);
    } else {
      // get all points including the source and target
      const points: FlCoord[] = [{x: this.source.x, y: this.source.y}, ...this.pointPositions, {
        x: this.target.x,
        y: this.target.y
      }];
      // we have to insert the point at a logical position
      let minDist = Infinity;
      let minDistIndex = -1;
      for (let i = 0; i < points.length - 1; i++) {
        // dist between the point and the segment i,  i+1
        const dist = FlCoordHelper.distToSegment(coord, points[i], points[i + 1]);
        if (dist < minDist) {
          minDist = dist;
          minDistIndex = i;
        }
      }
      // insert point at the right position
      this.pointPositions.splice(minDistIndex, 0, point);
    }

    this.savePoints();
  }

  public deletePoint(id: number): void {
    const index = this.pointPositions.findIndex(point => point.id === id);
    if (index !== -1) {
      this.pointPositions.splice(index, 1);
      this.savePoints();
    }

    // remove the circle element
    select(this.groupElement).selectAll('circle').filter((d: FlBioNetworkD3LinkPoint) => d.id === id).remove();
  }

  public pointsToCoords(): FlCoord[] {
    return this.pointPositions.map(point => point.toCoord());
  }

  // save the coord points to the reaction
  // todo to check with new format
  public savePoints(): void {
    const reaction = this.reaction;
    const metabolite = this.metabolite;
    if (reaction) {
      if (!reaction.data.metabolites[metabolite.data.id]) {
        console.error(`Can't find the metabolite ${metabolite.name} in reaction ${reaction.name}`);
        return;
      }
      reaction.data.metabolites[metabolite.data.id].points = this.pointsToCoords();
    }
  }


  public get reaction(): FlBioNetworkD3Reaction {
    if (this.target instanceof FlBioNetworkD3Reaction) return this.target;
    if (this.source instanceof FlBioNetworkD3Reaction) return this.source;
    return null;
  }

  public get metabolite(): FlBioNetworkD3Node {
    if (this.target instanceof FlBioNetworkD3Reaction) return this.source;
    if (this.source instanceof FlBioNetworkD3Reaction) return this.target;
    return null;
  }


  protected _getLevel(): FlBioNetworkMetaboliteLevel {
    // the link takes the highest level of the connected nodes
    return Math.max(this.source.getLevel(), this.target.getLevel());
  }

  public isInPathway(id: string): boolean {
    return this.target.isInPathway(id) || this.source.isInPathway(id);
  }

  public isInCluster(id: string): boolean {
    return this.target.isInCluster(id) || this.source.isInCluster(id);
  }
}
