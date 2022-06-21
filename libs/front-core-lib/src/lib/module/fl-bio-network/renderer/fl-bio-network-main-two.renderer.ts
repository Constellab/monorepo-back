import {Injectable, OnDestroy} from '@angular/core';
import ForceGraph, {ForceGraphInstance, GraphData} from 'force-graph';
import {FlBioNetworkD3, FlBioNetworkD3Object} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkSelectionTwoState} from '../state/fl-bio-network-selection-two.state';
import {FlBioNetworkOptions, FlBioNetworkOptionsState} from '../state/fl-bio-network-options.state';
import {FlBioNetworkState} from '../state/fl-bio-network.state';
import {FlBioNetworkSimulationState} from '../state/fl-bio-network-simulation.state';
import {ClSubscriptionHandler} from '@monorepo/core-lib';
import {FlBioNetworkZoomRenderer} from './fl-bio-network-zoom.renderer';
import {FlBioNetworkGridRenderer} from './fl-bio-network-grid.renderer';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {FlBioNetworkNodesRenderer} from './fl-bio-network-nodes.renderer';
import {FlBioNetworkLinksRenderer} from './fl-bio-network-links.renderer';
import {FlBioNetworkSelectionEvent, FlBioNetworkSelectionMode} from '../model/fl-bio-network-selection.class';
import {FlBioNetworkD3Node} from '../model/fl-bio-network-d3-node.class';
import {FlBioNetworkD3Cofactor} from '../model/fl-bio-network-d3-cofactor.class';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';

export interface FlBioNetworkGraphRenderer {
  graph: ForceGraphInstance;
  data: FlBioNetworkD3;
}

@Injectable()
export class FlBioNetworkMainTwoRenderer implements OnDestroy {

  private container: HTMLElement;

  private _graph$: BehaviorSubject<FlBioNetworkGraphRenderer> = new BehaviorSubject(null);

  private initSubscriptions: ClSubscriptionHandler;

  constructor(private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionTwoState,
              private optionState: FlBioNetworkOptionsState,
              private simulationState: FlBioNetworkSimulationState,
              private gridRenderer: FlBioNetworkGridRenderer,
              private nodesRenderer: FlBioNetworkNodesRenderer,
              private linksRenderer: FlBioNetworkLinksRenderer) {
  }


  public init(container: HTMLElement): void {
    this.container = container;
    this.state.getChartData$().subscribe(
      data => this.startSimulation(data)
    );
  }

  private async startSimulation(data: FlBioNetworkD3): Promise<void> {
    this.clearNetwork();

    if (data == null) return;

    const enableSimulation = !data.allNodesHavePositions();

    console.log('[BioNetwork] simulation : ' + enableSimulation);
    if (enableSimulation) {
      await this.simulationState.initSimulation(data);

      // once the simulation is over, save the new positions
      data.savePositions();
    }

    data.setCofactorsPositions();

    this.drawNetwork(data);
  }

  private drawNetwork(data: FlBioNetworkD3): void {
    this.initSubscriptions = new ClSubscriptionHandler();

    const myGraph = ForceGraph();

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    const graphData: GraphData = this.dataToGraph(data);

    const graph = myGraph(this.container)
      .graphData(graphData).width(width).height(height)
      .cooldownTicks(0) // pre-defined layout, cancel force engine iterations
      .autoPauseRedraw(true) // prevent redraw on every tick
      .onRenderFramePre((ctx: CanvasRenderingContext2D) => this.gridRenderer.drawGrid(ctx))
      .maxZoom(FlBioNetworkZoomRenderer.maxZoomScale)
      .minZoom(FlBioNetworkZoomRenderer.minZoomScale);

    this.nodesRenderer.render(graph);
    this.linksRenderer.render(graph);


    this.selectionState.init(data);
    this._graph$.next({
      graph: graph,
      data: data
    });

    this.initSubscriptions.add(
      combineLatest([this.selectionState.getSelectionMode$(), this.optionState.getOptions$()]).subscribe(
        ([selection, options]) => this.refreshGraph(graphData, selection, options)
      )
    );
  }

  private refreshGraph(graphData: GraphData, selection: FlBioNetworkSelectionEvent, options: FlBioNetworkOptions): void {
    this.updateVisibility(options, selection);

    this.forceDraw(graphData);
  }


  private updateVisibility(options: FlBioNetworkOptions, selection: FlBioNetworkSelectionEvent): void {

    const modeToShowCofactor: FlBioNetworkSelectionMode[] = ['singleNodeByClick', 'singleNode', 'multipleNodes'];
    const showRelatedCofactor = modeToShowCofactor.includes(selection.mode);


    const levelVisibility = (object: FlBioNetworkD3Object): boolean => options.visibleLevels.includes(object.getLevel());

    let visibilityNode: (object: FlBioNetworkD3Object) => boolean;
    let visibilityLink: (object: FlBioNetworkD3Link) => boolean;
    if (showRelatedCofactor) {
      visibilityNode = (object: FlBioNetworkD3Node) => {
        if (object instanceof FlBioNetworkD3Cofactor) {
          return object.parentNode?.selected;
        }
        return levelVisibility(object);
      };
      visibilityLink = (link: FlBioNetworkD3Link) => {
        if (link.source instanceof FlBioNetworkD3Cofactor) {
          return link.source.parentNode.selected;
        }else if(link.target instanceof FlBioNetworkD3Cofactor){
          return link.target.parentNode.selected;
        }
        return levelVisibility(link);
      };
    } else {
      visibilityNode = levelVisibility;
      visibilityLink = levelVisibility;
    }

    this.graphRenderer.graph.linkVisibility(visibilityLink);
    this.graphRenderer.graph.nodeVisibility(visibilityNode);
  }

  private forceDraw(graphData: GraphData): void {
    if (this.graphRenderer == null) return;

    this.graphRenderer.graph.graphData(graphData);
  }

  private dataToGraph(data: FlBioNetworkD3): GraphData {

    return {
      nodes: data.getAllNodes(),
      links: data.links
    };
  }

  private get graphRenderer(): FlBioNetworkGraphRenderer {
    return this._graph$.value;
  }

  public getGraphRenderer$(filterNull: boolean = true): Observable<FlBioNetworkGraphRenderer> {
    if (filterNull) {
      return this._graph$.asObservable().pipe(filter(graph => graph != null));
    } else {
      return this._graph$.asObservable();
    }
  }

  private clearNetwork(): void {
    // clear previous subscription
    this.initSubscriptions?.unsubscribe();

    this.graphRenderer?.graph.graphData({nodes: [], links: []});
  }

  ngOnDestroy(): void {
    this.graphRenderer?.graph._destructor();
  }


}
