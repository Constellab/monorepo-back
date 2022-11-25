import {FlBioNetworkNodeReaction} from '../model/fl-bio-network-node-reaction.class';
import {FlBioNetworkCanvasHelper} from '../utils/fl-bio-network-canvas.helper';
import {FlBioNetworkObjectColorFunction} from './fl-bio-network-object.renderer';
import {FlThemeDetail} from '../../fl-theme/model/fl-theme-detail.class';

/**
 * Draw reaction node using canvas
 */
export class FlBioNetworkReactionRenderer {

  public static size: number = 4;
  public static strokeWidth: number = 1;
  public static borderRadius: number = 1;
  public static existsInMultipleClusterRadius: number = 0.75;

  public static draw(ctx: CanvasRenderingContext2D, reaction: FlBioNetworkNodeReaction,
                     colorFunc: FlBioNetworkObjectColorFunction,themeDetail: FlThemeDetail): void {

    if (!reaction.selected) {
      ctx.globalAlpha = 0.1;
    } else {
      ctx.globalAlpha = 1;
    }

    // add white ring
    ctx.fillStyle = reaction.strokeColor;
    const globalSize = FlBioNetworkReactionRenderer.size + FlBioNetworkReactionRenderer.strokeWidth;
    FlBioNetworkCanvasHelper.roundedRect(ctx,
      reaction.x - (globalSize / 2), reaction.y - (globalSize / 2), globalSize,
      globalSize, FlBioNetworkReactionRenderer.borderRadius);


    // draw the rect center
    if (colorFunc == null) {
      ctx.fillStyle = reaction.defaultColor;
    } else {
      ctx.fillStyle = colorFunc(reaction);
    }
    const size = FlBioNetworkReactionRenderer.size;
    FlBioNetworkCanvasHelper.roundedRect(ctx, reaction.x - (size / 2),
      reaction.y - (size / 2), size, size, FlBioNetworkReactionRenderer.borderRadius);

    // if reaction also exist in another cluster, draw a small circle inside it
    if(reaction.existsInMultipleCluster){
      ctx.fillStyle = themeDetail.foreground;
      FlBioNetworkCanvasHelper.circle(ctx, reaction.x, reaction.y, FlBioNetworkReactionRenderer.existsInMultipleClusterRadius);
    }

    ctx.globalAlpha = 1;
  }

  public static drawPointerArea(ctx: CanvasRenderingContext2D, reaction: FlBioNetworkNodeReaction, color: string): void {
    // use the unique color for the pointer area
    ctx.fillStyle = color;

    const globalSize = FlBioNetworkReactionRenderer.size + FlBioNetworkReactionRenderer.strokeWidth;
    FlBioNetworkCanvasHelper.roundedRect(ctx,
      reaction.x - (globalSize / 2), reaction.y - (globalSize / 2), globalSize,
      globalSize, FlBioNetworkReactionRenderer.borderRadius);
    ctx.fill();
  }
}
