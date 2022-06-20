import {Injectable, OnDestroy} from '@angular/core';
import {FlBioNetworkD3Node} from '../model/fl-bio-network-d3-node.class';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FlBioNetworkSelectionEvent} from '../model/fl-bio-network-selection.class';
import {FlBioNetworkDrawerState} from './fl-bio-network-drawer.state';
import {FlBioNetworkMetabolite} from '../model/fl-bio-network.class';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';
import {FlBioNetworkD3Reaction} from '../model/fl-bio-network-d3-reaction.class';
import {FlCoord} from '../../../model/shared/fl-coord.class';
import {FlBioNetworkRendererTwoState} from './fl-bio-network-renderer-two.state';

/**
 * Class to manage the selection in the {@link FlBioNetworkComponent}
 * it manage the opacity of nodes and links
 */
@Injectable()
export class FlBioNetworkSelectionTwoState implements OnDestroy {

  private data: FlBioNetworkD3;

  private selection$: BehaviorSubject<FlBioNetworkSelectionEvent> = new BehaviorSubject({mode: 'none'});

  // opacity used when a object is hidden
  private readonly hiddenOpacity: number = 0.1;

  private subscription: Subscription;

  constructor(private drawerState: FlBioNetworkDrawerState,
              private rendererState: FlBioNetworkRendererTwoState) {
  }


  public init(data: FlBioNetworkD3): void {
    this.data = data;
    this.emitNone();

    this.subscription?.unsubscribe();
    this.subscription = this.drawerState.drawerClosed$().subscribe(
      () => this.resetSelection()
    );
  }


  /**
   * Select the nodes and direct links and hide all other node and links
   * @param node
   * @param zoomToNode if true we automatically zoom to node
   */
  public selectNodeAndDirectLinks(node: FlBioNetworkD3Node, zoomToNode: boolean = false): void {
    if (!this.isReady()) return;
    this.resetSelection2();


    const links: FlBioNetworkD3Link[] = this.getConnectedReactionsLinks([node.id]);

    // select the connected links
    this.selectLinksFromList(links);

    // select the connected nodes
    const nodes: FlBioNetworkD3Node[] = this.selectNodesFromLinks(links);

    this.selection$.next({mode: 'singleNode', nodes: nodes, links: links, selectedNode: node});

    // open the drawer with detail
    this.drawerState.newAction({
      action: 'nodeDetail',
      selectedNode: node
    });

    this.rendererState.forceDraw();
  }

  /**
   * Select the nodes and direct links and hide all other node and links
   */
  public selectNodesAndDirectLinks(nodes: FlBioNetworkD3Node[]): void {
    if (!this.isReady() || nodes.length === 0) return;


    const links: FlBioNetworkD3Link[] = this.getConnectedReactionsLinks(nodes.map(n => n.id));

    // select the connected links
    this.selectLinksFromList(links);

    // select the connected nodes
    const connectedNodes: FlBioNetworkD3Node[] = this.selectNodesFromLinks(links);

    this.selection$.next({mode: 'multipleNodes', nodes: connectedNodes, links: links, selectedNodes: nodes});

    const positions: FlCoord[] = nodes.map(n => ({x: n.x, y: n.y}));
  }

  public selectMetabolite(metaboliteId: string): void {
    if (!this.isReady()) return;

    // retrieve all the nodes that correspond to this metabolite
    const nodes = this.data.getMetabolitesNodes(metaboliteId);

    if (nodes.length === 0) {
      console.error(`No node found for metabolite ${metaboliteId}`);
    } else if (nodes.length === 1) {
      this.selectNodeAndDirectLinks(nodes[0], true);
    } else {
      // select them
      this.selectNodesAndDirectLinks(nodes);
    }
  }


  // set opacity to 0.1 to link and node where abs value is lower than value
  public fluxThresholdOpacity(value: number): void {
    if (!this.isReady()) return;

    if (value === 0) {
      this.resetSelection();
      return;
    }

    // reset the selection if the selection was different than linkByValue
    if (this.currentSelection().mode !== 'none' && this.currentSelection().mode !== 'linkByValue') {
      this.resetSelection(false);
    }

    const links: FlBioNetworkD3Link[] = [];
    // update link opacity
    // this.groupState.allLinks.style('opacity', (link: FlBioNetworkD3Link) => {
    //   if (link.absValue >= value) {
    //     links.push(link);
    //     return 1;
    //   } else {
    //     return this.hiddenOpacity;
    //   }
    // });

    // update the node opacity
    const nodes: FlBioNetworkD3Node[] = [];
    // this.groupState.allNodes.style('opacity', (node: FlBioNetworkD3Node) => {
    //   if (node.getLinkMaxValue() >= value) {
    //     nodes.push(node);
    //     return 1;
    //   } else {
    //     return this.hiddenOpacity;
    //   }
    // });

    this.selection$.next({mode: 'linkByValue', links: links, nodes: nodes});
  }


  /**
   * Select all the nodes and its link that are of compartments
   * @param compartments
   */
  public selectNodeByCompartments(compartments: string[]): void {
    if (!this.isReady()) return;

    if (compartments.length === 0) {
      this.resetSelection();
      return;
    }

    // get all the metabolites indexes in the compartments
    const nodeIds: symbol[] = this.data.getMetaboliteAndCofactors().filter(
      (node) =>
        compartments.includes((node.data as FlBioNetworkMetabolite).compartment)
    ).map(node => node.id);

    const links: FlBioNetworkD3Link[] = this.getConnectedLinks(nodeIds);

    // select the connected links
    this.selectLinksFromList(links);

    // select the connected nodes
    const nodes: FlBioNetworkD3Node[] = this.selectNodesFromLinks(links);

    this.selection$.next({mode: 'nodesByCompartments', nodes: nodes, links: links});
  }


  // return all the directly connected node of the node
  private getConnectedLinks(nodeIds: symbol[]): FlBioNetworkD3Link[] {
    return this.data.links
      // filter the link directly connected
      .filter(link => nodeIds.includes(link.target.id) || nodeIds.includes(link.source.id));
  }

  // return all the connected links to a node and if the connected node is a reaction
  // return also the link connected to the reaction
  private getConnectedReactionsLinks(nodeIds: symbol[]): FlBioNetworkD3Link[] {
    const links: FlBioNetworkD3Link[] = [];

    for (const link of this.data.links) {

      let otherNode: FlBioNetworkD3Node;
      if (nodeIds.includes(link.target.id)) {
        otherNode = link.source;
      } else if (nodeIds.includes(link.source.id)) {
        otherNode = link.target;
      }

      // if the node is directly connected
      if (otherNode) {
        links.push(link);

        // if the other part of the connection is a reaction, get also all the links of the reaction
        if (otherNode instanceof FlBioNetworkD3Reaction) {
          links.push(...otherNode.getAllLinks());
        }
      }
    }

    return links;
  }

  private selectLinksFromList(links: FlBioNetworkD3Link[]): void {
    for(const link of links) {
      link.selected = true;
    }
    // this.groupState.allLinks.style('opacity', (link: FlBioNetworkD3Link) =>
    //   links.findIndex(l => l.id === link.id) !== -1 ? 1 : this.hiddenOpacity);
  }

  // select all the nodes connected to the links and return the node list
  private selectNodesFromLinks(links: FlBioNetworkD3Link[]): FlBioNetworkD3Node[] {
    const nodes: FlBioNetworkD3Node[] = [];

    for (const link of links) {
      link.source.selected = true;
      link.target.selected = true;
    }
    // this.groupState.allNodes.style('opacity', (node: FlBioNetworkD3Node) => {
    //   // is the node is connected to one of the links
    //   if (links.findIndex(l => l.isLinkedToNode(node.id)) !== -1) {
    //     nodes.push(node); // save the node
    //     return 1;
    //   } else {
    //     return this.hiddenOpacity;
    //   }
    // });
    return nodes;
  }


  /**
   * Reset all the color of the nodes and links
   * @param emitSelection if true a none event is triggered in the selection
   */
  public resetSelection(emitSelection: boolean = true): any {
    if (!this.isReady()) return;

    // update opacity and color of nodes
    // this.groupState.allNodes.style('opacity', 1);

    // update link opacity
    // this.groupState.allLinks.style('opacity', 1);

    if (emitSelection) {
      this.emitNone();
    }
  }

  private resetSelection2(): void {
    for (const node of this.data.getAllObjects()) {
      node.selected = false;
    }
  }

  private emitNone(): void {
    this.selection$.next({mode: 'none'});
  }

  // get the selection of the nodes objects (not container)
  // private get allNodesCircle(): FlD3SelectionSimple<FlBioNetworkD3Node> {
  // return this.groupState.allNodes.selectAll(`.${flBioNetworkNodeClass}`);
  // }

  private currentSelection(): FlBioNetworkSelectionEvent {
    return this.selection$.value;
  }


  public getSelectionMode$(): Observable<FlBioNetworkSelectionEvent> {
    return this.selection$.asObservable();
  }

  private isReady(): boolean {
    return true;
  }


  ngOnDestroy(): void {
    this.selection$.complete();
  }
}
