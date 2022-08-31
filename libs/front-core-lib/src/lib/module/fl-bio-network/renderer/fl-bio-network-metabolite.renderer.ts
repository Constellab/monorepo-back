import {FlBioNetworkNodeMetabolite} from '../model/fl-bio-network-node-metabolite.class';
import {flBioNetworkCompartmentBiomassId} from '../model/fl-bio-network-compartment.class';
import {FlBioNetworkCanvasHelper} from '../utils/fl-bio-network-canvas.helper';
import {FlBioNetworkObjectColorFunction} from './fl-bio-network-object.renderer';

/**
 * Draw metabolite node using canvas
 */
export class FlBioNetworkMetaboliteRenderer {

  public static biomassMetaboliteRadius: number = 8;
  public static minorMetaboliteRadius: number = 3;
  public static majorMetaboliteRadius: number = 6;
  public static majorMetaboliteStroke: number = 1.5;
  public static minorMetaboliteStroke: number = 0.75;
  public static majorMetaboliteFontSize: string = '0.7em';
  public static minorMetaboliteFontSize: string = '0.4em';

  public static draw(ctx: CanvasRenderingContext2D, metabolite: FlBioNetworkNodeMetabolite,
                     colorFunc: FlBioNetworkObjectColorFunction, showText: boolean): void {

    if (!metabolite.selected) {
      ctx.globalAlpha = 0.1;
    } else {
      ctx.globalAlpha = 1;
    }

    const centerRadius = FlBioNetworkMetaboliteRenderer.getRadius(metabolite) + FlBioNetworkMetaboliteRenderer.getStrokeWidth(metabolite);
    const strokeWidth = FlBioNetworkMetaboliteRenderer.getStrokeWidth(metabolite);
    const globalRadius = centerRadius + strokeWidth;

    // add white ring
    ctx.fillStyle = '#ffffff';
    FlBioNetworkCanvasHelper.circle(ctx, metabolite.x, metabolite.y, globalRadius);

    // draw the circle
    ctx.fillStyle = colorFunc(metabolite);
    FlBioNetworkCanvasHelper.circle(ctx, metabolite.x, metabolite.y, centerRadius);

    // draw the text
    if (showText) {
      ctx.fillStyle = '#ffffff';
      FlBioNetworkCanvasHelper.text(ctx, metabolite.x, metabolite.y + (globalRadius * 1.5), metabolite.data.name.slice(0, 20),
        {
          fontSize: FlBioNetworkMetaboliteRenderer.getFontTextSize(metabolite),
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

  public static drawPointerArea(ctx: CanvasRenderingContext2D, metabolite: FlBioNetworkNodeMetabolite, color: string): void {
    // use the unique color for the pointer area
    ctx.fillStyle = color;

    const centerRadius = FlBioNetworkMetaboliteRenderer.getRadius(metabolite) + FlBioNetworkMetaboliteRenderer.getStrokeWidth(metabolite);
    const strokeWidth = FlBioNetworkMetaboliteRenderer.getStrokeWidth(metabolite);
    const globalRadius = centerRadius + strokeWidth;

    // simplify area to only select on node
    FlBioNetworkCanvasHelper.circle(ctx, metabolite.x, metabolite.y, globalRadius);
  }

  private static getRadius(metabolite: FlBioNetworkNodeMetabolite): number {
    if (metabolite.data.compartment === flBioNetworkCompartmentBiomassId) return FlBioNetworkMetaboliteRenderer.biomassMetaboliteRadius;
    return metabolite.isMajor() ? FlBioNetworkMetaboliteRenderer.majorMetaboliteRadius
      : FlBioNetworkMetaboliteRenderer.minorMetaboliteRadius;
  }

  private static getStrokeWidth(metabolite: FlBioNetworkNodeMetabolite): number {
    return metabolite.isMajor() ? FlBioNetworkMetaboliteRenderer.majorMetaboliteStroke
      : FlBioNetworkMetaboliteRenderer.minorMetaboliteStroke;
  }

  private static getFontTextSize(metabolite: FlBioNetworkNodeMetabolite): string {
    return metabolite.isMajor() ? FlBioNetworkMetaboliteRenderer.majorMetaboliteFontSize : FlBioNetworkMetaboliteRenderer.minorMetaboliteFontSize;
  }
}
