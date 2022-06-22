import {FlBioNetworkCanvasHelper} from '../utils/fl-bio-network-canvas.helper';
import {FlBioNetworkNodeCofactor} from '../model/fl-bio-network-node-cofactor.class';
import {FlBioNetworkObjectColorFunction} from './fl-bio-network-object.renderer';

/**
 * Draw cofactor node using canvas
 */
export class FlBioNetworkCofactorRenderer {

  public static size: number = 3.5;
  public static strokeWidth: number = 1;

  public static draw(ctx: CanvasRenderingContext2D, cofactor: FlBioNetworkNodeCofactor,
                     colorFunc: FlBioNetworkObjectColorFunction, showText: boolean): void {

    if (!cofactor.selected) {
      ctx.globalAlpha = 0.1;
    } else {
      ctx.globalAlpha = 1;
    }

    const globalRadius = FlBioNetworkCofactorRenderer.size + FlBioNetworkCofactorRenderer.strokeWidth;

    // add white ring
    ctx.fillStyle = '#ffffff';
    FlBioNetworkCanvasHelper.diamond(ctx, cofactor.x, cofactor.y, globalRadius);

    // draw the circle
    if (colorFunc == null) {
      ctx.fillStyle = cofactor.defaultColor;
    } else {
      ctx.fillStyle = colorFunc(cofactor);
    }
    FlBioNetworkCanvasHelper.diamond(ctx, cofactor.x, cofactor.y, FlBioNetworkCofactorRenderer.size);

    // draw the text
    if (showText) {
      ctx.fillStyle = '#ffffff';
      FlBioNetworkCanvasHelper.text(ctx, cofactor.x, cofactor.y + (globalRadius * 1.7), cofactor.data.name,
        {
          fontSize: '0.3em',
          fontFamily: 'Sans-Serif', // todo to fix
          textAlign: 'center',
          shadow: {
            blur: 7,
            color: '#000000', // todo to fix
          }
        });
    }

    ctx.globalAlpha = 1;
  }

  public static drawPointerArea(ctx: CanvasRenderingContext2D, metabolite: FlBioNetworkNodeCofactor, color: string): void {
    // use the unique color for the pointer area
    ctx.fillStyle = color;


    const globalRadius = FlBioNetworkCofactorRenderer.size + FlBioNetworkCofactorRenderer.strokeWidth;

    // simplify area to only select on node
    FlBioNetworkCanvasHelper.diamond(ctx, metabolite.x, metabolite.y, globalRadius);
  }
}
