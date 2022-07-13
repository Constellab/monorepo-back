import {SimulationNodeDatum} from 'd3';
import {FlBioNetworkMetabolite, FlBioNetworkMetaboliteLevel, FlBioNetworkReaction} from './fl-bio-network.class';
import {FlBioNetworkLink} from './fl-bio-network-node-link.class';
import {FlBioNetworkGraphObject} from './fl-bio-network-graph.class';
import {FlCoord} from '../../../model/shared/fl-coord.class';


export type FlBioNetworkNodeType = 'metabolite' | 'reaction' | 'cofactor';

export abstract class FlBioNetworkNode extends FlBioNetworkGraphObject implements SimulationNodeDatum {
  private static globalId: number = 0;

  public readonly id: number;


  // the following properties are set by d3
  // Node’s zero-based index into nodes array. This property is set during the initialization process of a simulation.
  index?: number;
  // Node’s current x-position
  x?: number;
  //Node’s current y-position
  y?: number;
  // Node’s current x-velocity
  vx?: number;
  // Node’s current y-velocity
  vy?: number;

  fx?: number;
  fy?: number;

  public departureLinks: FlBioNetworkLink[] = [];
  public arrivalLinks: FlBioNetworkLink[] = [];

  // list of nodes that are linked to this node
  // It means that when this node moves, all the linked nodes move
  public childNodes: FlBioNetworkNode[] = [];
  public parentNode: FlBioNetworkNode;

  public isVisible: boolean = true;

  protected constructor(public name: string, public type: FlBioNetworkNodeType,
                        public defaultColor: string, public strokeColor: string,
                        public data: FlBioNetworkMetabolite | FlBioNetworkReaction) {
    super();
    this.id = FlBioNetworkNode.globalId++;
  }


  protected abstract _getLevel(): FlBioNetworkMetaboliteLevel;


  ///////////////////////////////////////////// POSITIONS ////////////////////////////////

  public getCoords(): FlCoord {
    return {
      x: this.x, y: this.y
    };
  }


  /**
   * Set the position of the node
   * return the ids of the moved nodes
   */
  public setPosition(coord: FlCoord): void {
    this.x = coord.x;
    this.y = coord.y;

    this.savePosition();
  }

  public setPositionAndFreeze(coord: FlCoord): void {
    this.setPosition(coord);
    this.freezePosition();
  }

  public hasPositions(): boolean {
    return this.x != null && this.y != null;
  }

  public savePosition(): void {
  }

  public initPosition(): void {
    if (this.x == null && this.y == null) {
      this.setPosition({x: 0, y: 0});
    }
  }

  // set the fixed positions = positions
  public freezePosition(): void {
    this.fx = this.x;
    this.fy = this.y;
  }

  ///////////////////////////////////////////// NODES ////////////////////////////////////////////
  public addChildNode(node: FlBioNetworkNode): void {
    this.childNodes.push(node);
    node.parentNode = this;
  }

  public getNextNodes(): FlBioNetworkNode[] {
    return this.departureLinks.map(link => link.target);
  }

  public getPreviousNodes(): FlBioNetworkNode[] {
    return this.arrivalLinks.map(link => link.source);
  }

  public getConnectedNodes(): FlBioNetworkNode[] {
    return [...this.getPreviousNodes(), ...this.getNextNodes()];
  }

  public getAllLinks(): FlBioNetworkLink[] {
    return [...this.departureLinks, ...this.arrivalLinks];
  }

  /**
   * Search the link, link to the node and the provided node
   * @param nodeId
   */
  public getLinkToNode(nodeId: number): FlBioNetworkLink | null {
    // search on departure links
    let link = this.departureLinks.find(link => link.target.id === nodeId);
    if (link) return link;

    // search on arrival links
    link = this.arrivalLinks.find(link => link.source.id === nodeId);
    return link;
  }

  public getLinkMaxValue(): number {
    return Math.max(...[...this.departureLinks, ...this.arrivalLinks].map(link => link.absValue));
  }
}
