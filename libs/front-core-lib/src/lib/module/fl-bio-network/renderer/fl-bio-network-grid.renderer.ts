import {Injectable} from '@angular/core';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlBioNetworkGridState} from '../state/fl-bio-network-grid.state';


@Injectable()
export class FlBioNetworkGridRenderer {

  private readonly gridColor: string;

  constructor(themeService: FlThemeService) {
    this.gridColor = themeService.getCurrentThemeDetail().greyLowContrast;
  }

  public drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.gridColor;
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
