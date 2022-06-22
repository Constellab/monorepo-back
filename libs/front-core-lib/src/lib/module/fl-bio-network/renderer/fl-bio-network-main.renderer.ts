import {Injectable, OnDestroy} from '@angular/core';
import ForceGraph, {ForceGraphInstance, GraphData} from 'force-graph';
import {FlBioNetworkGraph} from '../model/fl-bio-network-graph.class';
import {FlBioNetworkSelectionState} from '../state/fl-bio-network-selection.state';
import {FlBioNetworkOptionsState} from '../state/fl-bio-network-options.state';
import {FlBioNetworkState} from '../state/fl-bio-network.state';
import {FlBioNetworkSimulationState} from '../state/fl-bio-network-simulation.state';
import {ClSubscriptionHandler} from '@monorepo/core-lib';
import {FlBioNetworkZoomRenderer} from './fl-bio-network-zoom.renderer';
import {FlBioNetworkGridRenderer} from './fl-bio-network-grid.renderer';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {FlBioNetworkNodesRenderer} from './fl-bio-network-nodes.renderer';
import {FlBioNetworkLinksRenderer} from './fl-bio-network-links.renderer';
import {FlBioNetworkGridState} from '../state/fl-bio-network-grid.state';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';

export interface FlBioNetworkGraphRenderer {
  graph: ForceGraphInstance;
  data: FlBioNetworkGraph;
}

@Injectable()
export class FlBioNetworkMainRenderer implements OnDestroy {

  private container: HTMLElement;

  private _graph$: BehaviorSubject<FlBioNetworkGraphRenderer> = new BehaviorSubject(null);

  private initSubscriptions: ClSubscriptionHandler;

  private nodesRenderer: FlBioNetworkNodesRenderer;
  private linksRenderer: FlBioNetworkLinksRenderer;

  constructor(private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState,
              private optionState: FlBioNetworkOptionsState,
              private simulationState: FlBioNetworkSimulationState,
              private gridRenderer: FlBioNetworkGridRenderer,
              private gridState: FlBioNetworkGridState,
              private themeService: FlThemeService) {
  }


  public init(container: HTMLElement): void {
    this.container = container;
    this.state.getChartData$().subscribe(
      data => this.startSimulation(data)
    );
  }

  private async startSimulation(data: FlBioNetworkGraph): Promise<void> {
    this.clearNetwork();

    if (data == null) return;

    const enableSimulation = !data.allNodesHavePositions();

    if (enableSimulation) {
      await this.simulationState.initSimulation(data);

      // once the simulation is over, save the new positions
      data.savePositions();
    }

    data.setCofactorsPositions();

    this.drawNetwork(data);
  }

  private drawNetwork(data: FlBioNetworkGraph): void {
    this.initSubscriptions = new ClSubscriptionHandler();


    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    const graphData: GraphData = this.dataToGraph(data);

    const graph = ForceGraph()(this.container)
      .graphData(graphData).width(width).height(height)
      .cooldownTicks(0) // pre-defined layout, cancel force engine iterations
      .autoPauseRedraw(true) // prevent redraw on every tick
      .onRenderFramePre((ctx: CanvasRenderingContext2D) => this.gridRenderer.drawGrid(ctx))
      .maxZoom(FlBioNetworkZoomRenderer.maxZoomScale)
      .minZoom(FlBioNetworkZoomRenderer.minZoomScale);


    const graphRenderer: FlBioNetworkGraphRenderer = {
      graph: graph,
      data: data
    };

    const themeDetail: FlThemeDetail = this.themeService.getCurrentThemeDetail();
    const grey = themeDetail.greyLowContrast;
    this.nodesRenderer = new FlBioNetworkNodesRenderer(graphRenderer, this.optionState.getOptions$(),
      this.selectionState.getSelectionMode$(), grey,
      this.selectionState, this.gridState);
    this.nodesRenderer.render();

    this.linksRenderer = new FlBioNetworkLinksRenderer(graphRenderer, this.optionState.getOptions$(),
      this.selectionState.getSelectionMode$(), grey);
    this.linksRenderer.render();


    this.selectionState.init(data);
    this._graph$.next(graphRenderer);

  }

  private forceDraw(graphData: GraphData): void {
    if (this.graphRenderer == null) return;

    this.graphRenderer.graph.graphData(graphData);
  }

  private dataToGraph(data: FlBioNetworkGraph): GraphData {

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
    this.nodesRenderer?.destroy();
    this.linksRenderer?.destroy();

    this.graphRenderer?.graph.graphData({nodes: [], links: []});
  }

  ngOnDestroy(): void {
    this.graphRenderer?.graph._destructor();
  }


}
