import {FlBioNetworkGridState} from '../state/fl-bio-network-grid.state';
import {Observable} from 'rxjs';
import {FlBioNetworkOptions} from '../state/fl-bio-network-options.state';
import {FlBioNetworkGraphRenderer} from './fl-bio-network-main.renderer';

/**
 * Renderer for the background grid
 */
export class FlBioNetworkGridRenderer {


  constructor(private graphRenderer: FlBioNetworkGraphRenderer,
              private color: string,
              options$: Observable<FlBioNetworkOptions>) {
    options$.subscribe(
      action => this.updateGrid(action.showGrid)
    );
  }

  private updateGrid(showGrid: boolean): void {
    if (showGrid) {
      this.graphRenderer.graph.onRenderFramePre((ctx: CanvasRenderingContext2D) => this.drawGrid(ctx));
    } else {
      this.graphRenderer.graph.onRenderFramePre(null);
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 0.1;

    let i = -FlBioNetworkGridState.gridSize;
    while (i < FlBioNetworkGridState.gridSize) {
      // vertical lines
      ctx.beginPath();
      ctx.moveTo(i, -FlBioNetworkGridState.gridSize);
      ctx.lineTo(i, FlBioNetworkGridState.gridSize);
      ctx.stroke();

      // horizontal lines
      ctx.beginPath();
      ctx.moveTo(-FlBioNetworkGridState.gridSize, i);
      ctx.lineTo(FlBioNetworkGridState.gridSize, i);
      ctx.stroke();

      ctx.stroke();
      i += FlBioNetworkGridState.gridStep;
    }
  }
}
