import {FlBioNetworkD3Metabolite} from '../model/fl-bio-network-d3-metabolite.class';
import {flBioNetworkCompartmentBiomass} from '../model/fl-bio-network-compartment.class';
import {FlBioNetworkCanvasHelper} from '../utils/fl-bio-network-canvas.helper';
import {FlBioNetworkD3Object} from '../model/fl-bio-network-d3.class';


export class FlBioNetworkMetaboliteRenderer {

  public static biomassMetaboliteRadius: number = 20;
  public static minorMetaboliteRadius: number = 6;
  public static majorMetaboliteRadius: number = 12;
  public static majorMetaboliteStroke: number = 3;
  public static minorMetaboliteStroke: number = 1.5;

  public static draw(ctx: CanvasRenderingContext2D, metabolite: FlBioNetworkD3Metabolite,
                     colorFunc?: (node: FlBioNetworkD3Object) => string): void {

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
    if (colorFunc == null) {
      ctx.fillStyle = metabolite.defaultColor;
    } else {
      ctx.fillStyle = colorFunc(metabolite);
    }
    FlBioNetworkCanvasHelper.circle(ctx, metabolite.x, metabolite.y, centerRadius);

    // draw the text
    ctx.fillStyle = '#ffffff';
    FlBioNetworkCanvasHelper.text(ctx, metabolite.x, metabolite.y + (globalRadius * 1.5), metabolite.data.name,
      {
        fontSize: FlBioNetworkMetaboliteRenderer.getFontTextSize(metabolite),
        fontFamily: 'Sans-Serif', // todo to fix
        textAlign: 'center',
        shadow: {
          blur: 7,
          color: '#000000', // todo to fix
        }
      });

    ctx.globalAlpha = 1;
  }

  public static drawPointerArea(ctx: CanvasRenderingContext2D, metabolite: FlBioNetworkD3Metabolite, color: string): void {
    // use the unique color for the pointer area
    ctx.fillStyle = color;

    const centerRadius = FlBioNetworkMetaboliteRenderer.getRadius(metabolite) + FlBioNetworkMetaboliteRenderer.getStrokeWidth(metabolite);
    const strokeWidth = FlBioNetworkMetaboliteRenderer.getStrokeWidth(metabolite);
    const globalRadius = centerRadius + strokeWidth;

    // simplify area to only select on node
    FlBioNetworkCanvasHelper.circle(ctx, metabolite.x, metabolite.y, globalRadius);
  }

  private static getRadius(metabolite: FlBioNetworkD3Metabolite): number {
    if (metabolite.data.compartment === flBioNetworkCompartmentBiomass.id) return FlBioNetworkMetaboliteRenderer.biomassMetaboliteRadius;
    return metabolite.isMajor() ? FlBioNetworkMetaboliteRenderer.majorMetaboliteRadius
      : FlBioNetworkMetaboliteRenderer.minorMetaboliteRadius;
  }

  private static getStrokeWidth(metabolite: FlBioNetworkD3Metabolite): number {
    return metabolite.isMajor() ? FlBioNetworkMetaboliteRenderer.majorMetaboliteStroke
      : FlBioNetworkMetaboliteRenderer.minorMetaboliteStroke;
  }

  private static getFontTextSize(metabolite: FlBioNetworkD3Metabolite): string {
    return metabolite.isMajor() ? '1.3em' : '0.5em';
  }
}
