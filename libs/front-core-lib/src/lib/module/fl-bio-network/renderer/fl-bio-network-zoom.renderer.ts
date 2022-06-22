import {Injectable} from '@angular/core';
import {FlBioNetworkMainRenderer} from './fl-bio-network-main.renderer';
import {FlBioNetworkSelectionState} from '../state/fl-bio-network-selection.state';
import {FlBioNetworkSelectionEvent} from '../model/fl-bio-network-selection.class';
import {FlBioNetworkNode} from '../model/fl-bio-network-node.class';
import {combineLatest} from 'rxjs';
import {ForceGraphInstance} from 'force-graph';


@Injectable()
export class FlBioNetworkZoomRenderer {

  public static readonly minZoomScale: number = 0.1;
  public static readonly maxZoomScale: number = 10;

  // Default zoom scale when zooming to a position
  private readonly zoomToPositionScale: number = 0.5;

  private readonly zoomDuration: number = 750;

  constructor(private mainRenderer: FlBioNetworkMainRenderer,
              private selectionState: FlBioNetworkSelectionState) {
  }


  public init(): void {
    combineLatest([this.mainRenderer.getGraphRenderer$(), this.selectionState.getSelectionMode$()]).subscribe(
      ([graphRenderer, selection]) => this.zoomOnSelection(graphRenderer.graph, selection));
  }

  private zoomOnSelection(graph: ForceGraphInstance, selection: FlBioNetworkSelectionEvent): void {
    if (graph == null || selection == null) return;
    if (selection.mode === 'singleNode') {
      this.zoomToPosition(graph, selection.selectedNode.x, selection.selectedNode.y);
    } else if (selection.mode === 'multipleNodes') {
      this.zoomToSelectedElements(graph);
    }
  }


  /**
   * Method to zoom to a position
   */
  private zoomToPosition(graph: ForceGraphInstance, posX: number, posY: number,
                         scale: number = this.zoomToPositionScale): void {
    graph.centerAt(posX, posY, this.zoomDuration);
    graph.zoom(scale, this.zoomDuration);
  }

  private zoomToSelectedElements(graph: ForceGraphInstance): void {
    graph.zoomToFit(this.zoomDuration, 20,
      (node: FlBioNetworkNode) => node.selected);
  }
}
