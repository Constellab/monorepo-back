import {FlBioNetworkCanvasHelper} from '../utils/fl-bio-network-canvas.helper';
import {FlBioNetworkD3Object} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkD3Cofactor} from '../model/fl-bio-network-d3-cofactor.class';


export class FlBioNetworkCofactorRenderer {

  public static size: number = 3.5;
  public static strokeWidth: number = 1;

  public static draw(ctx: CanvasRenderingContext2D, metabolite: FlBioNetworkD3Cofactor,
                     colorFunc?: (node: FlBioNetworkD3Object) => string): void {

    if (!metabolite.selected) {
      ctx.globalAlpha = 0.1;
    } else {
      ctx.globalAlpha = 1;
    }

    const globalRadius = FlBioNetworkCofactorRenderer.size + FlBioNetworkCofactorRenderer.strokeWidth;

    // add white ring
    ctx.fillStyle = '#ffffff';
    FlBioNetworkCanvasHelper.diamond(ctx, metabolite.x, metabolite.y, globalRadius);

    // draw the circle
    if (colorFunc == null) {
      ctx.fillStyle = metabolite.defaultColor;
    } else {
      ctx.fillStyle = colorFunc(metabolite);
    }
    FlBioNetworkCanvasHelper.diamond(ctx, metabolite.x, metabolite.y, FlBioNetworkCofactorRenderer.size);

    // draw the text
    ctx.fillStyle = '#ffffff';
    FlBioNetworkCanvasHelper.text(ctx, metabolite.x, metabolite.y + (globalRadius * 1.7), metabolite.data.name,
      {
        fontSize: '0.3em',
        fontFamily: 'Sans-Serif', // todo to fix
        textAlign: 'center',
        shadow: {
          blur: 7,
          color: '#000000', // todo to fix
        }
      });

    ctx.globalAlpha = 1;
  }

  public static drawPointerArea(ctx: CanvasRenderingContext2D, metabolite: FlBioNetworkD3Cofactor, color: string): void {
    // use the unique color for the pointer area
    ctx.fillStyle = color;


    const globalRadius = FlBioNetworkCofactorRenderer.size + FlBioNetworkCofactorRenderer.strokeWidth;

    // simplify area to only select on node
    FlBioNetworkCanvasHelper.diamond(ctx, metabolite.x, metabolite.y, globalRadius);
  }
}
