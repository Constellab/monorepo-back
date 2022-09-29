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
import {FlCoord} from '../../../model/shared/fl-coord.class';
import {FlBioNetworkEngineState} from '../state/fl-bio-network-engine.state';

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
  private gridRenderer: FlBioNetworkGridRenderer;

  // all node outside the screen + this margin will not be rendered
  private hideScreenMargin: number = 20;

  constructor(private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState,
              private optionState: FlBioNetworkOptionsState,
              private simulationState: FlBioNetworkSimulationState,
              private gridState: FlBioNetworkGridState,
              private themeService: FlThemeService,
              private engineState: FlBioNetworkEngineState) {
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

    const engineConfig = this.engineState.engineConfig;

    if (enableSimulation && !engineConfig.liveDrawing) {
      await this.simulationState.initSimulation(data, engineConfig);

      // once the simulation is over, save the new positions
      // data.savePositions();
    }

    data.setCofactorsPositions();

    this.drawNetwork(data);
  }

  private drawNetwork(data: FlBioNetworkGraph): void {
    this.initSubscriptions = new ClSubscriptionHandler();


    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    const engineConfig = this.engineState.engineConfig;
    // get data, if we draw in live, we don't include the cofactors to disturb the graph. We add them later.
    const graphData: GraphData = this.dataToGraph(data, !engineConfig.liveDrawing);


    const graph = ForceGraph()(this.container)
      .graphData(graphData).width(width).height(height)
      .autoPauseRedraw(true) // prevent redraw on every tick
      .maxZoom(FlBioNetworkZoomRenderer.maxZoomScale)
      .minZoom(FlBioNetworkZoomRenderer.minZoomScale)
      .zoom(FlBioNetworkZoomRenderer.defaultZoomScale)
      .onBackgroundClick(() => this.selectionState.clearSelection())
      .cooldownTime(engineConfig.liveDrawing ? 60000 : null)
      // if live drawing, we set null so it will calculate positions
      // otherwise we set 0 because positions where calculated already
      .cooldownTicks(engineConfig.liveDrawing ? undefined : 0)
      .d3AlphaDecay(engineConfig.alphaDecay)
      .d3AlphaMin(engineConfig.alphaMin)
      .d3VelocityDecay(engineConfig.velocityDecay)
      .d3Force('link', this.simulationState.getLinkForce(data, engineConfig))
      .d3Force('charge', this.simulationState.getChargeForce(engineConfig))
      .d3Force('center', this.simulationState.getCenterForce(engineConfig))
      .onEngineTick(() => this.simulationState.newTick())
    ;


    if (engineConfig.liveDrawing) {
      this.simulationState.markAsStarted(engineConfig);
      // once the simulation is over, stop the simulation
      graph.onEngineStop(() => {
        // clear the engine stop listener
        graph.onEngineStop(() => {
        });

        graph.cooldownTicks(0);
        // set the data with the cofactors
        graph.graphData(this.dataToGraph(data, true));

        this.simulationState.markAsEnded();
      });
    }


    const graphRenderer: FlBioNetworkGraphRenderer = {
      graph: graph,
      data: data
    };

    const themeDetail: FlThemeDetail = this.themeService.getCurrentThemeDetail();
    const grey = themeDetail.greyLowContrast;

    this.gridRenderer = new FlBioNetworkGridRenderer(graphRenderer, grey, this.optionState.getOptions$());
    this.nodesRenderer = new FlBioNetworkNodesRenderer(graphRenderer, this.optionState.getOptions$(),
      this.selectionState.getSelectionMode$(), grey,
      this.selectionState, this.gridState);
    this.nodesRenderer.render();

    this.linksRenderer = new FlBioNetworkLinksRenderer(graphRenderer, this.optionState.getOptions$(),
      this.selectionState.getSelectionMode$(), grey);
    this.linksRenderer.render();


    this.selectionState.init(data);
    this._graph$.next(graphRenderer);

    // hide nodes and links that are outside the screen
    graph.onZoom((transform) => {
      const canvasSize = this.getCanvasSize();
      const xWidth = canvasSize.x / transform.k;
      const yHeight = canvasSize.y / transform.k;

      const fromX = transform.x - xWidth / 2 - this.hideScreenMargin;
      const fromY = transform.y - yHeight / 2 - this.hideScreenMargin;
      const toX = transform.x + xWidth / 2 + this.hideScreenMargin;
      const toY = transform.y + yHeight / 2 + this.hideScreenMargin;

      for (const node of data.getMetabolitesAndReactions()) {
        // set visibility of nodes from position
        node.isVisible = node.x >= fromX && node.x <= toX &&
          node.y >= fromY && node.y <= toY;
      }
      for (const link of data.getMetaboliteAndReactionLinks()) {
        // set visibility of links from position
        link.isVisible = link.source.isVisible || link.target.isVisible;
      }
    });

  }

  private forceDraw(graphData: GraphData): void {
    if (this.graphRenderer == null) return;

    this.graphRenderer.graph.graphData(graphData);
  }

  private dataToGraph(data: FlBioNetworkGraph, includeCofactors: boolean): GraphData {
    if (includeCofactors) {
      return {
        nodes: data.getAllNodes(),
        links: data.getAllLinks()
      };
    } else {
      return {
        nodes: data.getMetabolitesAndReactions(),
        links: data.getMetaboliteAndReactionLinks()
      };
    }
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

  private getCanvasSize(): FlCoord {
    return {
      x: this.container.clientWidth,
      y: this.container.clientHeight
    };
  }

  ngOnDestroy(): void {
    this.graphRenderer?.graph._destructor();
  }


}
