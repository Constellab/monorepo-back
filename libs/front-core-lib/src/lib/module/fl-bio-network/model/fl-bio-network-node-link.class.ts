import {curveCatmullRom, line, select, SimulationLinkDatum} from 'd3';
import {FlBioNetworkMetaboliteLevel, FlBioNetworkReactionData} from './fl-bio-network.class';
import {FlBioNetworkNode} from './fl-bio-network-node.class';
import {FlBioNetworkNodeCofactor} from './fl-bio-network-node-cofactor.class';
import {FlBioNetworkNodeReaction} from './fl-bio-network-node-reaction.class';
import {FlBioNetworkGraphObject} from './fl-bio-network-graph.class';
import {FlCoord, FlCoordHelper} from '../../../model/shared/fl-coord.class';
import {FlBioNetworkHelper} from '../utils/fl-bio-network.helper';


// const lineFunction = line<FlCoord>().x(d => d.x).y(d => d.y);
// const lineFunction = line<FlCoord>().x(d => d.x).y(d => d.y).curve(curveStep);
const lineFunction = line<FlCoord>().x(d => d.x).y(d => d.y).curve(curveCatmullRom.alpha(1));

export class FlBioNetworkLinkPoint implements FlCoord {
  private static id: number = 0;

  id: number;

  constructor(public x: number, public y: number, public link: FlBioNetworkLink) {
    this.id = FlBioNetworkLinkPoint.id++;
  }

  public setCoord(coord: FlCoord): void {
    this.x = coord.x;
    this.y = coord.y;
    // this.link.savePoints();
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


export class FlBioNetworkLink extends FlBioNetworkGraphObject
  implements SimulationLinkDatum<FlBioNetworkNode> {

  private static id: number = 0;

  id: number;

  source: FlBioNetworkNode;
  target: FlBioNetworkNode;

  pointPositions: FlBioNetworkLinkPoint[] = [];

  // group element containing the link (path) and the points (circles)
  groupElement: SVGGElement;

  value: number;
  absValue: number;

  isVisible: boolean = true;

  constructor(source: FlBioNetworkNode, target: FlBioNetworkNode,
              public reactionData: FlBioNetworkReactionData,
              public defaultColor: string) {
    super();
    this.source = source;
    this.target = target;
    this.id = FlBioNetworkLink.id++;

    // init each points
    // if (points) {
    //   points.forEach(point => this.pointPositions.push(new FlBioNetworkLinkPoint(point.x, point.y, this)));
    // }

    // add the link to the source and target
    this.source.departureLinks.push(this);
    this.target.arrivalLinks.push(this);

    const flux = FlBioNetworkHelper.getReactionFlux(this.reactionData);
    this.value = flux ? flux.value : 0;
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
    return this.source instanceof FlBioNetworkNodeCofactor || this.target instanceof FlBioNetworkNodeCofactor;
  }


  ////////////////////////////////////// POINTS //////////////////////////////////////
  public getPathAttr(): string {
    if (!this.source.hasPositions() || !this.target.hasPositions()) return null;
    return lineFunction(this.getPathPoints());
  }

  public getPathPoints(): FlCoord[] {
    const startCoord: FlCoord = this.source.getCoords();
    const endCoord: FlCoord = this.target.getCoords();
    return [startCoord, ...this.pointPositions, endCoord];
  }


  /**
   * Insert a new point in the points. It calculates where to insert the points
   * @param coord
   */
  public insertPoint(coord: FlCoord): void {
    const point: FlBioNetworkLinkPoint = new FlBioNetworkLinkPoint(coord.x, coord.y, this);

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

    // this.savePoints();
  }

  public deletePoint(id: number): void {
    const index = this.pointPositions.findIndex(point => point.id === id);
    if (index !== -1) {
      this.pointPositions.splice(index, 1);
      // this.savePoints();
    }

    // remove the circle element
    select(this.groupElement).selectAll('circle').filter((d: FlBioNetworkLinkPoint) => d.id === id).remove();
  }

  // public pointsToCoords(): FlCoord[] {
  //   return this.pointPositions.map(point => point.toCoord());
  // }

  // save the coord points to the reaction
  // public savePoints(): void {
  //   const reaction = this.reaction;
  //   const metabolite = this.metabolite;
  //   if (reaction) {
  //     if (!reaction.data.metabolites[metabolite.data.id]) {
  //       console.error(`Can't find the metabolite ${metabolite.name} in reaction ${reaction.name}`);
  //       return;
  //     }
  //     reaction.data.metabolites[metabolite.data.id].points = this.pointsToCoords();
  //   }
  // }


  public get reaction(): FlBioNetworkNodeReaction {
    if (this.target instanceof FlBioNetworkNodeReaction) return this.target;
    if (this.source instanceof FlBioNetworkNodeReaction) return this.source;
    return null;
  }

  public get metabolite(): FlBioNetworkNode {
    if (this.target instanceof FlBioNetworkNodeReaction) return this.source;
    if (this.source instanceof FlBioNetworkNodeReaction) return this.target;
    return null;
  }

  public getLength(): number {
    return Math.sqrt((this.source.x - this.target.x) ** 2 + (this.source.y - this.target.y) ** 2);
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
