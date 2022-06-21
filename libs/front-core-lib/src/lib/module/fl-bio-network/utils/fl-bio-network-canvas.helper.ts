export interface FlBioNetworkCanvasText {
  textAlign: 'center';
  fontSize: string;
  fontFamily: string;
  shadow?: {
    blur: number; // width of the blur
    color: string; // color of the shadow
  };
}

/**
 * Helper to simplify draw of shapes on canvas.
 */
export class FlBioNetworkCanvasHelper {


  public static roundedRect(ctx: CanvasRenderingContext2D,
                            x: number, y: number,
                            width: number, height: number,
                            radius: number = 5, mode: 'fill' | 'stroke' = 'fill'): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (mode === 'fill') {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }

  public static circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number,
                       mode: 'fill' | 'stroke' = 'fill'): void {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    if (mode === 'fill') {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }

  public static diamond(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number,
                        mode: 'fill' | 'stroke' = 'fill'): void {
    ctx.beginPath();
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x + radius, y);
    ctx.lineTo(x, y + radius);
    ctx.lineTo(x - radius, y);
    ctx.closePath();
    if (mode === 'fill') {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }

  public static text(ctx: CanvasRenderingContext2D,
                     x: number, y: number, text: string,
                     style: FlBioNetworkCanvasText): void {
    ctx.font = `${style.fontSize} ${style.fontFamily}`;
    ctx.textAlign = style.textAlign;
    ctx.textBaseline = 'middle';

    if (style.shadow) {
      ctx.shadowColor = style.shadow.color;
      ctx.shadowBlur = style.shadow.blur;
    }
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0; // reset blur
  }
}
