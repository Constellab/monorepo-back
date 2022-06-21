import {Injectable, OnDestroy} from '@angular/core';
import {FlBioNetworkD3Node} from '../model/fl-bio-network-d3-node.class';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FlBioNetworkSelectionEvent} from '../model/fl-bio-network-selection.class';
import {FlBioNetworkDrawerState} from './fl-bio-network-drawer.state';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';
import {FlBioNetworkD3Reaction} from '../model/fl-bio-network-d3-reaction.class';

/**
 * Class to manage the selection in the {@link FlBioNetworkComponent}
 * it manage the opacity of nodes and links
 */
@Injectable()
export class FlBioNetworkSelectionTwoState implements OnDestroy {

  private data: FlBioNetworkD3;

  private selection$: BehaviorSubject<FlBioNetworkSelectionEvent> = new BehaviorSubject({mode: 'none'});

  private subscription: Subscription;

  constructor(private drawerState: FlBioNetworkDrawerState) {
  }


  public init(data: FlBioNetworkD3): void {
    this.data = data;
    this.emitNone();
    this.selectAll();

    this.subscription?.unsubscribe();
    this.subscription = this.drawerState.drawerClosed$().subscribe(
      () => {
        this.selectAll();
        this.emitNone();
      }
    );
  }


  /**
   * Select the nodes and direct links and hide all other node and links
   */
  public selectNodeAndDirectLinks(node: FlBioNetworkD3Node, mode: 'singleNode' | 'singleNodeByClick'): void {
    this.unselectAll();

    const links: FlBioNetworkD3Link[] = this.getConnectedReactionsLinks([node.id]);

    // select the connected nodes
    const nodes: FlBioNetworkD3Node[] = this.selectNodesAndLinksFromLinks(links);

    this.selection$.next({mode: mode, nodes: nodes, links: links, selectedNode: node});

    // open the drawer with detail
    this.drawerState.newAction({
      action: 'nodeDetail',
      selectedNode: node
    });
  }

  /**
   * Select the nodes and direct links and hide all other node and links
   */
  public selectNodesAndDirectLinks(nodes: FlBioNetworkD3Node[]): void {
    this.unselectAll();

    if (nodes.length === 0) return;

    const links: FlBioNetworkD3Link[] = this.getConnectedReactionsLinks(nodes.map(n => n.id));

    // select the connected nodes
    const connectedNodes: FlBioNetworkD3Node[] = this.selectNodesAndLinksFromLinks(links);

    this.selection$.next({mode: 'multipleNodes', nodes: connectedNodes, links: links, selectedNodes: nodes});
  }

  public selectMetabolite(metaboliteId: string): void {

    // retrieve all the nodes that correspond to this metabolite
    const nodes = this.data.getMetabolitesNodes(metaboliteId);

    if (nodes.length === 0) {
      console.error(`No node found for metabolite ${metaboliteId}`);
    } else if (nodes.length === 1) {
      this.selectNodeAndDirectLinks(nodes[0], 'singleNode');
    } else {
      // select them
      this.selectNodesAndDirectLinks(nodes);
    }
  }


  // set opacity to 0.1 to link and node where abs value is lower than value
  public fluxThresholdOpacity(value: number): void {
    if (value === 0) {
      this.resetSelection();
      return;
    }

    const links: FlBioNetworkD3Link[] = [];
    for (const link of this.data.links) {
      if (link.absValue >= value) {
        link.selected = true;
        links.push(link);
      } else {
        link.selected = false;
      }
    }

    // update the node opacity
    const nodes: FlBioNetworkD3Node[] = [];
    // todo to see if we get all nodes
    for (const node of this.data.getAllNodes()) {
      if (node.getLinkMaxValue() >= value) {
        node.selected = true;
        nodes.push(node);
      } else {
        node.selected = false;
      }
    }
    this.selection$.next({mode: 'linkByValue', links: links, nodes: nodes});
  }


  /**
   * Select all the nodes and its link that are of compartments
   * @param compartments
   */
  public selectNodeByCompartments(compartments: string[]): void {

    if (compartments.length === 0) {
      this.resetSelection();
      return;
    }

    this.unselectAll();

    // get all the metabolites indexes in the compartments
    const nodeIds: number[] = this.data.getMetaboliteAndCofactors().filter(
      (node) =>
        compartments.includes(node.data.compartment)
    ).map(node => node.id);

    const links: FlBioNetworkD3Link[] = this.getConnectedLinks(nodeIds);

    // select the connected nodes
    const nodes: FlBioNetworkD3Node[] = this.selectNodesAndLinksFromLinks(links);

    this.selection$.next({mode: 'nodesByCompartments', nodes: nodes, links: links});
  }


  // return all the directly connected node of the node
  private getConnectedLinks(nodeIds: number[]): FlBioNetworkD3Link[] {
    return this.data.links
      // filter the link directly connected
      .filter(link => nodeIds.includes(link.target.id) || nodeIds.includes(link.source.id));
  }

  // return all the connected links to a node and if the connected node is a reaction
  // return also the link connected to the reaction
  private getConnectedReactionsLinks(nodeIds: number[]): FlBioNetworkD3Link[] {
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

  // select all the nodes connected to the links and return the node list
  private selectNodesAndLinksFromLinks(links: FlBioNetworkD3Link[]): FlBioNetworkD3Node[] {
    const nodes: FlBioNetworkD3Node[] = [];

    for (const link of links) {
      link.selected = true;
      link.source.selected = true;
      link.target.selected = true;
      nodes.push(link.source, link.target);
    }
    return nodes;
  }


  /**
   * Reset all the color of the nodes and links
   * @param emitSelection if true a none event is triggered in the selection
   */
  public resetSelection(emitSelection: boolean = true): any {
    this.selectAll();

    if (emitSelection) {
      this.emitNone();
    }
  }

  private unselectAll(): void {
    for (const node of this.data.getAllObjects()) {
      node.selected = false;
    }
    for (const link of this.data.links) {
      link.selected = false;
    }
  }

  private selectAll(): void {
    for (const node of this.data.getAllObjects()) {
      node.selected = true;
    }
    for (const link of this.data.links) {
      link.selected = true;
    }
  }

  private emitNone(): void {
    this.selection$.next({mode: 'none'});
  }

  private currentSelection(): FlBioNetworkSelectionEvent {
    return this.selection$.value;
  }

  public getSelectionMode$(): Observable<FlBioNetworkSelectionEvent> {
    return this.selection$.asObservable();
  }


  ngOnDestroy(): void {
    this.selection$.complete();
  }
}
