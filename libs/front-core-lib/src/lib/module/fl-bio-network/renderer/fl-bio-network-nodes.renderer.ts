import {Injectable} from '@angular/core';
import {ForceGraphInstance} from 'force-graph';
import {FlBioNetworkD3Node} from '../model/fl-bio-network-d3-node.class';
import {FlBioNetworkD3Metabolite} from '../model/fl-bio-network-d3-metabolite.class';
import {FlBioNetworkMetaboliteRenderer} from './fl-bio-network-metabolite.renderer';
import {FlBioNetworkD3Reaction} from '../model/fl-bio-network-d3-reaction.class';
import {FlBioNetworkReactionRenderer} from './fl-bio-network-reaction.renderer';
import {FlBioNetworkSelectionTwoState} from '../state/fl-bio-network-selection-two.state';
import {FlBioNetworkGridTwoState} from '../state/fl-bio-network-grid-two.state';
import {FlBioNetworkD3Cofactor} from '../model/fl-bio-network-d3-cofactor.class';
import {FlBioNetworkCofactorRenderer} from './fl-bio-network-cofactor.renderer';

@Injectable()
export class FlBioNetworkNodesRenderer {

  constructor(private selectionState: FlBioNetworkSelectionTwoState,
              private gridState: FlBioNetworkGridTwoState) {
  }


  public render(graph: ForceGraphInstance): void {
    // draw the node
    graph.nodeCanvasObject((node: FlBioNetworkD3Node, ctx) =>
      this.nodePaint(node, ctx))
      // draw the pointer area for interactions
      .nodePointerAreaPaint((node: FlBioNetworkD3Node, color: string, ctx: CanvasRenderingContext2D) =>
        this.nodePaintPointerArea(node, ctx, color))
      .nodeVal(() => 5)
      .onNodeClick((node: FlBioNetworkD3Node) => this.selectionState.selectNodeAndDirectLinks(node, 'singleNodeByClick'))
      .onNodeDrag((node: FlBioNetworkD3Node) => {
        const coord = {x: node.x, y: node.y};
        const newPos = this.gridState.roundCoordOnGrid(coord);
        if (newPos) {
          node.setPositionAndFreeze(newPos);
        }

        if (node instanceof FlBioNetworkD3Reaction) {
          node.setCofactorsPositions();
        }
      });
  }

  public setColorFunction(graph: ForceGraphInstance, colorFunc: (node: FlBioNetworkD3Node) => string): void {
    graph.nodeCanvasObject((node: FlBioNetworkD3Node, ctx: CanvasRenderingContext2D) =>
      this.nodePaint(node, ctx, colorFunc));
  }

  public setDefaultColor(graph: ForceGraphInstance): void {
    graph.nodeCanvasObject((node: FlBioNetworkD3Node, ctx: CanvasRenderingContext2D) =>
      this.nodePaint(node, ctx));
  }

  private nodePaint(node: FlBioNetworkD3Node, ctx: CanvasRenderingContext2D,
                    colorFunc?: (node: FlBioNetworkD3Node) => string): void {
    if (node instanceof FlBioNetworkD3Metabolite) {
      FlBioNetworkMetaboliteRenderer.draw(ctx, node, colorFunc);
    } else if (node instanceof FlBioNetworkD3Reaction) {
      FlBioNetworkReactionRenderer.draw(ctx, node, colorFunc);
    } else if (node instanceof FlBioNetworkD3Cofactor) {
      FlBioNetworkCofactorRenderer.draw(ctx, node, colorFunc);
    } else {
      console.log('node type not supported');
    }
  }

  private nodePaintPointerArea(node: FlBioNetworkD3Node, ctx: CanvasRenderingContext2D, color: string): void {
    if (node instanceof FlBioNetworkD3Metabolite) {
      FlBioNetworkMetaboliteRenderer.drawPointerArea(ctx, node, color);
    } else if (node instanceof FlBioNetworkD3Reaction) {
      FlBioNetworkReactionRenderer.drawPointerArea(ctx, node, color);
    } else if (node instanceof FlBioNetworkD3Cofactor) {
      FlBioNetworkCofactorRenderer.drawPointerArea(ctx, node, color);
    } else {
      console.log('node type not supported');
    }
  }
}
