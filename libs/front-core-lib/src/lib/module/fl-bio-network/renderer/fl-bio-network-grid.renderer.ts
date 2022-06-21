import {Injectable} from '@angular/core';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlBioNetworkGridTwoState} from '../state/fl-bio-network-grid-two.state';


@Injectable()
export class FlBioNetworkGridRenderer {

  private readonly gridColor: string;

  constructor(themeService: FlThemeService) {
    this.gridColor = themeService.getCurrentThemeDetail().greyLowContrast;
  }

  public drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 0.1;

    let i = -FlBioNetworkGridTwoState.gridSize;
    while (i < FlBioNetworkGridTwoState.gridSize) {
      // vertical lines
      ctx.beginPath();
      ctx.moveTo(i, -FlBioNetworkGridTwoState.gridSize);
      ctx.lineTo(i, FlBioNetworkGridTwoState.gridSize);
      ctx.stroke();

      // horizontal lines
      ctx.beginPath();
      ctx.moveTo(-FlBioNetworkGridTwoState.gridSize, i);
      ctx.lineTo(FlBioNetworkGridTwoState.gridSize, i);
      ctx.stroke();

      ctx.stroke();
      i += FlBioNetworkGridTwoState.gridStep;
    }
  }
}
