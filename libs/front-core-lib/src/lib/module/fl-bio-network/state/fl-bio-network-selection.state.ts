import {Injectable, OnDestroy} from '@angular/core';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlBioNetworkD3Node, flBioNetworkNodeClass} from '../model/fl-bio-network-d3.class';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FlBioNetworkSelectionEvent} from '../model/fl-bio-network-selection.class';
import {FlBioNetworkDrawerState} from './fl-bio-network-drawer.state';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlBioNetworkMetabolite} from '../model/fl-bio-network.class';
import {FlBioxNetworkD3} from '../model/fl-bio-network-d3-network.class';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';

/**
 * Class to manage the selection in the {@link FlBioNetworkComponent}
 * it manage the opacity of nodes and links
 */
@Injectable()
export class FlBioNetworkSelectionState implements OnDestroy {

  private data: FlBioxNetworkD3;
  private nodesContainer: FlD3SelectionSimple<FlBioNetworkD3Node>;
  private links: FlD3SelectionSimple<FlBioNetworkD3Link>;

  private selection$: BehaviorSubject<FlBioNetworkSelectionEvent> = new BehaviorSubject({mode: 'none'});

  // opacity used when a object is hidden
  private readonly hiddenOpacity: number = 0.1;
  private readonly selectUniqueNodeColor: string;

  private subscription: Subscription;

  constructor(private drawerState: FlBioNetworkDrawerState, private themeService: FlThemeService) {
    this.selectUniqueNodeColor = themeService.getCurrentThemeDetail().warn;
  }


  public init(data: FlBioxNetworkD3,
              nodesContainer: FlD3SelectionSimple<FlBioNetworkD3Node>,
              links: FlD3SelectionSimple<FlBioNetworkD3Link>): void {
    this.data = data;
    this.nodesContainer = nodesContainer;
    this.links = links;
    this.emitNone();

    this.subscription?.unsubscribe();
    this.subscription = this.drawerState.drawerClosed$().subscribe(
      () => this.resetSelection()
    );
  }


  /**
   * Select the nodes and direct links and hide all other node and links
   * @param nodeIndex
   */
  public selectNodeAndDirectLinks(nodeIndex: number): void {
    if (!this.isReady()) return;

    this.selectNodesAndDirectLinks([nodeIndex]);

    // set a specific color to the selected node
    this.nodes.attr('stroke', (d: FlBioNetworkD3Node) => d.index === nodeIndex ? this.selectUniqueNodeColor : d.color);
  }

  public selectNodesAndDirectLinks(nodesIndexes: number[]): void {
    if (!this.isReady()) return;

    const links: FlBioNetworkD3Link[] = this.getConnectedLinks(nodesIndexes);

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
    this.links.style('opacity', (link: FlBioNetworkD3Link) => {
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
    const nodesIndexes: number[] = this.data.getMetabolitesNodes().filter(
      (node) =>
        compartments.includes((node.data as FlBioNetworkMetabolite).compartment)
    ).map(node => node.index);

    const links: FlBioNetworkD3Link[] = this.getConnectedLinks(nodesIndexes);

    // select the connected links
    this.selectLinksFromList(links);

    // select the connected nodes
    const nodes: FlBioNetworkD3Node[] = this.selectNodesFromLinks(links);

    this.selection$.next({mode: 'nodesByCompartments', nodes: nodes, links: links});
  }

  // return all the directly connected node of the node
  private getConnectedLinks(nodesIndexes: number[]): FlBioNetworkD3Link[] {
    return this.data.links
      // filter the link directly connected
      .filter(link => nodesIndexes.includes(link.target.index) || nodesIndexes.includes(link.source.index));
  }

  private selectLinksFromList(links: FlBioNetworkD3Link[]): void {
    this.links.style('opacity', (link: FlBioNetworkD3Link) =>
      links.findIndex(l => l.index === link.index) !== -1 ? 1 : this.hiddenOpacity);
  }

  // select all the nodes connected to the links and return the node list
  private selectNodesFromLinks(links: FlBioNetworkD3Link[]): FlBioNetworkD3Node[] {
    const nodes: FlBioNetworkD3Node[] = [];
    this.nodesContainer.style('opacity', (node: FlBioNetworkD3Node) => {
      // is the node is connected to one of the links
      if (links.findIndex(l => l.isLinkedToNode(node.index)) !== -1) {
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
    this.nodesContainer.style('opacity', 1);
    this.nodes.attr('stroke', (d: FlBioNetworkD3Node) => d.color);

    // update link opacity
    this.links.style('opacity', 1);

    if (emitSelection) {
      this.emitNone();
    }
  }

  private emitNone(): void {
    this.selection$.next({mode: 'none'});
  }

  // get the selection of the nodes objects (not container)
  private get nodes(): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return this.nodesContainer.selectAll(`.${flBioNetworkNodeClass}`);
  }

  private currentSelection(): FlBioNetworkSelectionEvent {
    return this.selection$.value;
  }

  public getSelectionMode$(): Observable<FlBioNetworkSelectionEvent> {
    return this.selection$.asObservable();
  }

  private isReady(): boolean {
    return this.nodesContainer != null && this.links != null;
  }


  ngOnDestroy(): void {
    this.selection$.complete();
  }
}
