import {Injectable, OnDestroy} from '@angular/core';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlBioNetworkD3Node, flBioNetworkNodeClass} from '../model/fl-bio-network-d3-node.class';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FlBioNetworkSelectionEvent} from '../model/fl-bio-network-selection.class';
import {FlBioNetworkDrawerState} from './fl-bio-network-drawer.state';
import {FlBioNetworkMetabolite, FlBioNetworkPathwaySelection} from '../model/fl-bio-network.class';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';
import {FlBioNetworkZoomState} from './fl-bio-network-zoom.state';
import {FlBioNetworkGroupState} from './fl-bio-network-group.state';
import {FlBioNetworkD3Reaction} from '../model/fl-bio-network-d3-reaction.class';

/**
 * Class to manage the selection in the {@link FlBioNetworkComponent}
 * it manage the opacity of nodes and links
 */
@Injectable()
export class FlBioNetworkSelectionState implements OnDestroy {

  private data: FlBioNetworkD3;

  private selection$: BehaviorSubject<FlBioNetworkSelectionEvent> = new BehaviorSubject({mode: 'none'});

  // opacity used when a object is hidden
  private readonly hiddenOpacity: number = 0.1;

  private subscription: Subscription;

  constructor(private drawerState: FlBioNetworkDrawerState,
              private groupState: FlBioNetworkGroupState,
              private zoomState: FlBioNetworkZoomState) {
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

    this.selectNodesAndDirectLinks([node.id]);

    // open the drawer with detail
    this.drawerState.newAction({
      action: 'nodeDetail',
      selectedNode: node
    });

    if (zoomToNode) {
      this.zoomState.zoomToPosition(node.x, node.y);
    }
  }

  public selectNodesAndDirectLinks(nodeIds: string[]): void {
    if (!this.isReady()) return;

    const links: FlBioNetworkD3Link[] = this.getConnectedReactionsLinks(nodeIds);

    // select the connected links
    this.selectLinksFromList(links);

    // select the connected nodes
    const nodes: FlBioNetworkD3Node[] = this.selectNodesFromLinks(links);

    this.selection$.next({mode: 'nodes', nodes: nodes, links: links});
  }

  // set opacity to 0.1 to link where abs value is lower than slider value
  public hideLinkLowerThan(value: number): void {
    if (!this.isReady()) return;

    // reset the selection if the selection was different than linkByValue
    if (this.currentSelection().mode !== 'none' && this.currentSelection().mode !== 'linkByValue') {
      this.resetSelection(false);
    }

    const links: FlBioNetworkD3Link[] = [];
    // update link opacity
    this.groupState.visibleLinks.style('opacity', (link: FlBioNetworkD3Link) => {
      if (link.absValue >= value) {
        links.push(link);
        return 1;
      } else {
        return this.hiddenOpacity;
      }
    });

    this.selection$.next({mode: 'linkByValue', links: links});
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
    const nodeIds: string[] = this.data.getMetaboliteAndCofactors().filter(
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

  public toggleAllPathwayHighlight(pathways: FlBioNetworkPathwaySelection[]): void {
    // if there is at least one pathways not highlighted
    const highlight: boolean = pathways.some(pathway => !pathway.highlighted);
    for (const pathway of pathways) {
      if (pathway.highlighted != highlight) {
        this.togglePathwayHighlight(pathway);
      }
    }
  }

  public togglePathwayHighlight(pathway: FlBioNetworkPathwaySelection): void {
    if (!this.isReady()) return;

    // retrieve all the reaction of the pathway
    const reactions: FlBioNetworkD3Node[] = this.data.getReactionsOfPathway(pathway.id);
    const reactionsIds: string[] = reactions.map(reaction => reaction.id);

    const links: FlD3SelectionSimple<FlBioNetworkD3Link> =
      this.groupState.allLinks.filter((link: FlBioNetworkD3Link) => link.isLinkedToAnyNode(reactionsIds));
    const nodeSelection: FlD3SelectionSimple<FlBioNetworkD3Node> =
      this.allNodes.filter((node: FlBioNetworkD3Node) => reactionsIds.includes(node.id));

    // if the pathway was not highlighted
    if (!pathway.highlighted) {
      links.style('stroke', pathway.color);
      nodeSelection.style('stroke', pathway.color);
    } else {
      links.style('stroke', 'grey'); // todo this color is not correct
      nodeSelection.style('stroke', node => node.fillColor);
    }
    pathway.highlighted = !pathway.highlighted;
  }


  // return all the directly connected node of the node
  private getConnectedLinks(nodeIds: string[]): FlBioNetworkD3Link[] {
    return this.data.links
      // filter the link directly connected
      .filter(link => nodeIds.includes(link.target.id) || nodeIds.includes(link.source.id));
  }

  // return all the connected links to a node and if the connected node is a reaction
  // return also the link connected to the reaction
  private getConnectedReactionsLinks(nodeIds: string[]): FlBioNetworkD3Link[] {
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
    this.groupState.visibleLinks.style('opacity', (link: FlBioNetworkD3Link) =>
      links.findIndex(l => l.id === link.id) !== -1 ? 1 : this.hiddenOpacity);
  }

  // select all the nodes connected to the links and return the node list
  private selectNodesFromLinks(links: FlBioNetworkD3Link[]): FlBioNetworkD3Node[] {
    const nodes: FlBioNetworkD3Node[] = [];
    this.groupState.visibleNodes.style('opacity', (node: FlBioNetworkD3Node) => {
      // is the node is connected to one of the links
      if (links.findIndex(l => l.isLinkedToNode(node.id)) !== -1) {
        nodes.push(node); // save the node
        return 1;
      } else {
        return this.hiddenOpacity;
      }
    });
    return nodes;
  }


  /**
   * Reset all the color of the nodes and links
   * @param emitSelection if true a none event is triggered in the selection
   */
  public resetSelection(emitSelection: boolean = true): any {
    if (!this.isReady()) return;

    // update opacity and color of nodes
    this.groupState.visibleNodes.style('opacity', 1);

    // update link opacity
    this.groupState.visibleLinks.style('opacity', 1);

    if (emitSelection) {
      this.emitNone();
    }
  }

  private emitNone(): void {
    this.selection$.next({mode: 'none'});
  }

  // get the selection of the nodes objects (not container)
  private get allNodes(): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return this.groupState.visibleNodes.selectAll(`.${flBioNetworkNodeClass}`);
  }

  private currentSelection(): FlBioNetworkSelectionEvent {
    return this.selection$.value;
  }


  public getSelectionMode$(): Observable<FlBioNetworkSelectionEvent> {
    return this.selection$.asObservable();
  }

  private isReady(): boolean {
    return this.groupState.mainGroup != null;
  }


  ngOnDestroy(): void {
    this.selection$.complete();
  }
}
