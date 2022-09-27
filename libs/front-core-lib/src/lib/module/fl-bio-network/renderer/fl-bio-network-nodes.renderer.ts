import {FlBioNetworkNode} from '../model/fl-bio-network-node.class';
import {FlBioNetworkNodeMetabolite} from '../model/fl-bio-network-node-metabolite.class';
import {FlBioNetworkMetaboliteRenderer} from './fl-bio-network-metabolite.renderer';
import {FlBioNetworkNodeReaction} from '../model/fl-bio-network-node-reaction.class';
import {FlBioNetworkReactionRenderer} from './fl-bio-network-reaction.renderer';
import {FlBioNetworkSelectionState} from '../state/fl-bio-network-selection.state';
import {FlBioNetworkGridState} from '../state/fl-bio-network-grid.state';
import {FlBioNetworkNodeCofactor} from '../model/fl-bio-network-node-cofactor.class';
import {FlBioNetworkCofactorRenderer} from './fl-bio-network-cofactor.renderer';
import {FlBioNetworkOptions} from '../state/fl-bio-network-options.state';
import {Observable} from 'rxjs';
import {FlBioNetworkObjectColorFunction, FlBioNetworkObjectRenderer} from './fl-bio-network-object.renderer';
import {FlBioNetworkGraphRenderer} from './fl-bio-network-main.renderer';
import {FlBioNetworkGraphObject} from '../model/fl-bio-network-graph.class';
import {FlBioNetworkMetaboliteLevel} from '../model/fl-bio-network.class';
import {FlBioNetworkSelectionEvent} from '../model/fl-bio-network-selection.class';

/**
 * Class to render nodes of the network (metabolites, reactions and cofactors)
 */
export class FlBioNetworkNodesRenderer extends FlBioNetworkObjectRenderer {

  public positions: {
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  };

  constructor(graphRenderer: FlBioNetworkGraphRenderer,
              options$: Observable<FlBioNetworkOptions>,
              selection$: Observable<FlBioNetworkSelectionEvent>,
              greyColor: string,
              private selectionState: FlBioNetworkSelectionState,
              private gridState: FlBioNetworkGridState) {
    super(graphRenderer, options$, selection$, greyColor);
  }


  public render(): void {
    // draw the node
    this.graphRenderer.graph
      // draw the pointer area for interactions
      .nodePointerAreaPaint((node: FlBioNetworkNode, color: string, ctx: CanvasRenderingContext2D) =>
        this.nodePaintPointerArea(node, ctx, color))
      .nodeVal(() => 5)
      // .nodeRelSize(6)
      .onNodeClick((node: FlBioNetworkNode) => this.selectionState.selectNodeAndDirectLinks(node, 'singleNodeByClick'))
      .onNodeDrag((node: FlBioNetworkNode) => {
        const coord = {x: node.x, y: node.y};
        const newPos = this.gridState.roundCoordOnGrid(coord);
        if (newPos) {
          node.setPositionAndFreeze(newPos);
        }

        if (node instanceof FlBioNetworkNodeReaction) {
          node.setCofactorsPositions();
        }
      });
  }

  protected updateObjectColors(options: FlBioNetworkOptions): void {
    let colorFunc: FlBioNetworkObjectColorFunction;
    if (options.coloredClusters?.length > 0) {
      colorFunc = this.getClusterColorFunction(options.coloredClusters);
    } else {
      colorFunc = this.getDefaultColorFunction();
    }

    this.graphRenderer.graph.nodeCanvasObject((node: FlBioNetworkNode, ctx: CanvasRenderingContext2D) =>
      this.nodePaint(node, ctx, colorFunc, options.showTexts));
  }

  public updateVisibility(visibleLevels: FlBioNetworkMetaboliteLevel[],
                          selectedNode: FlBioNetworkNode | null,
                          showRelatedCofactor: boolean): void {
    let visibilityNode: (object: FlBioNetworkGraphObject) => boolean;

    const levelVisibility = this.getLevelVisibilityFunction(visibleLevels);

    if (showRelatedCofactor) {
      visibilityNode = (object: FlBioNetworkNode) => {
        // show the cofactor only if the parent reaction is selected and visible
        if (object instanceof FlBioNetworkNodeCofactor) {
          return object.showCofactor(visibleLevels);
        }
        return levelVisibility(object);
      };
    } else {
      visibilityNode = (object: FlBioNetworkNode) => object.isVisible && levelVisibility(object);
    }

    this.graphRenderer.graph.nodeVisibility(visibilityNode);
  }


  private nodePaint(node: FlBioNetworkNode, ctx: CanvasRenderingContext2D,
                    colorFunc: FlBioNetworkObjectColorFunction, showText: boolean): void {
    // if node position are not  inside positions
    if (this.positions && (node.x < this.positions.fromX || node.x > this.positions.toX ||
      node.y < this.positions.fromY || node.y > this.positions.toY)) {
      return;
    }

    if (node instanceof FlBioNetworkNodeMetabolite) {
      FlBioNetworkMetaboliteRenderer.draw(ctx, node, colorFunc, showText);
    } else if (node instanceof FlBioNetworkNodeReaction) {
      FlBioNetworkReactionRenderer.draw(ctx, node, colorFunc);
    } else if (node instanceof FlBioNetworkNodeCofactor) {
      FlBioNetworkCofactorRenderer.draw(ctx, node, colorFunc, showText);
    } else {
      console.log('node type not supported');
    }
  }

  private nodePaintPointerArea(node: FlBioNetworkNode, ctx: CanvasRenderingContext2D, color: string): void {
    if (node instanceof FlBioNetworkNodeMetabolite) {
      FlBioNetworkMetaboliteRenderer.drawPointerArea(ctx, node, color);
    } else if (node instanceof FlBioNetworkNodeReaction) {
      FlBioNetworkReactionRenderer.drawPointerArea(ctx, node, color);
    } else if (node instanceof FlBioNetworkNodeCofactor) {
      FlBioNetworkCofactorRenderer.drawPointerArea(ctx, node, color);
    } else {
      console.log('node type not supported');
    }
  }
}
