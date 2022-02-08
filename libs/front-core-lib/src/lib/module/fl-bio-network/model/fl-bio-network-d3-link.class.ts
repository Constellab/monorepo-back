import {curveCatmullRom, line, select, SimulationLinkDatum} from 'd3';
import {FlBioNetworkMetaboliteLevel, FlBioNetworkReactionEstimate} from './fl-bio-network.class';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';
import {FlBioNetworkD3Cofactor} from './fl-bio-network-d3-cofactor.class';
import {FlBioNetworkD3Metabolite} from './fl-bio-network-d3-metabolite.class';
import {FlBioNetworkD3Reaction} from './fl-bio-network-d3-reaction.class';
import {FlBioNetworkD3Object} from './fl-bio-network-d3.class';
import {FlCoord, FlCoordHelper} from '../../../model/shared/fl-coord.class';


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

  visible: boolean = true;

  pointPositions: FlBioNetworkD3LinkPoint[] = [];

  // group element containing the link (path) and the points (circles)
  groupElement: SVGGElement;

  constructor(source: FlBioNetworkD3Node, target: FlBioNetworkD3Node,
              public estimate: FlBioNetworkReactionEstimate, points: FlCoord[]) {
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
  }

  get value(): number {
    return typeof this.estimate.value === 'number' ? this.estimate.value : 0;
  }

  get absValue(): number {
    return Math.abs(this.value);
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

  isLinkedToNode(nodeId: string): boolean {
    return this.source.id === nodeId || this.target.id === nodeId;
  }

  isLinkedToAnyNode(nodeIds: string[]): boolean {
    return nodeIds.some(nodeIndex => this.isLinkedToNode(nodeIndex));
  }

  // return true if the link is linked to a cofactor
  isLinkedToCofactor(): boolean {
    return this.source instanceof FlBioNetworkD3Cofactor || this.target instanceof FlBioNetworkD3Cofactor;
  }

  getLinkWidth(): number {
    return this.absLog10Value + 1;
  }

  // return true if the link is linked to one major metabolite and to a reaction linked to another metabolite
  isMajor(): boolean {
    // cas when the source is a Metabolite and the target a reaction
    return (this.source instanceof FlBioNetworkD3Metabolite && this.target instanceof FlBioNetworkD3Reaction
        && this.source.isMajor() &&
        this.target.getNextNodes().some(node => node instanceof FlBioNetworkD3Metabolite && node.isMajor())) ||
      // cas when the source is a Reaction and the target a metabolite
      (this.target instanceof FlBioNetworkD3Metabolite && this.source instanceof FlBioNetworkD3Reaction
        && this.target.isMajor() &&
        this.source.getPreviousNodes().some(node => node instanceof FlBioNetworkD3Metabolite && node.isMajor()));
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
  public savePoints(): void {
    const reaction = this.reaction;
    const metabolite = this.metabolite;
    if (reaction) {
      if (!reaction.data.metabolites[metabolite.id]) {
        console.error(`Can't find the metabolite ${metabolite.id} in reaction ${reaction.id}`);
        return;
      }
      reaction.data.metabolites[metabolite.id].points = this.pointsToCoords();
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
}
