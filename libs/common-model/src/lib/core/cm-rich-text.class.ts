export interface CmRichTextI {
  ops: CmRichTextOp[];
}

export interface CmRichTextOp {
  insert: any;
  attributes?: any;
}

/**
 * Object representing the value stored to create a figure
 */
export interface CmRichTextFigure {
  filename: string;
  title?: string;
  caption?: string;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

export interface CmRichTextFigureOp extends CmRichTextOp {
  insert: {
    figure: CmRichTextFigure
  };
}


export class CmRichText {

  private static readonly figureOps = 'figure';

  constructor(private richText: CmRichTextI) {
  }

  public getContent(): CmRichTextI {
    return this.richText;
  }

  public getHeaders(headersSize: number[]): string[] {
    const headers: any[] = [];
    const contentData: any[] = this.getContent().ops;
    if (contentData != null) {
      contentData.forEach((c, i) => {
        if (contentData[i + 1] && contentData[i + 1].attributes && contentData[i + 1].attributes.header
          && (headersSize.includes(contentData[i + 1].attributes.header))) {
          const inserts: string[] = c.insert.split('\n');
          if (inserts.length > 1) headers.push([contentData[i + 1].attributes.header, inserts[inserts.length - 1]]);
          else headers.push([contentData[i + 1].attributes.header, c.insert]);
        }
      });
    }
    return headers;
  }


  ///////////////////////////////////// FIGURE ///////////////////////////////////////////////


  /**
   * Update the figure with the name
   * @param filename
   * @param figure
   */
  public updateFigure(filename: string, figure: Partial<CmRichTextFigure>): void {
    const opsFigure: CmRichTextFigureOp = this.getFigureOp(filename);

    if (opsFigure == null) return;

    opsFigure.insert.figure = Object.assign(opsFigure.insert.figure, figure);
  }


  public getFigureOp(filename: string): CmRichTextFigureOp | undefined {
    return this.findSpecialOp(CmRichText.figureOps, (figureOp: CmRichTextFigureOp) => figureOp.insert.figure.filename === filename);
  }

  public getFiguresOps(): CmRichTextFigureOp[] {
    return this.getSpecialOps(CmRichText.figureOps);
  }

  ///////////////////////////////////// SPECIAL OPS ///////////////////////////////////////////////
  /**
   * Override a spacial ops value
   * @param opsType
   * @param findPredicate
   * @param newValue
   */
  public setSpecialOps(opsType: string, findPredicate: (ops: any, index: number) => boolean, newValue: any): void {
    const specialOps: CmRichTextOp = this.findSpecialOp(opsType, findPredicate);

    if (specialOps == null) return;

    // update inset param
    specialOps.insert[opsType] = newValue;
  }

  public getSpecialOps(opsType: string): CmRichTextOp[] {
    return this.richText.ops.filter(
      op => op.insert[opsType] !== null && typeof op.insert[opsType] === 'object',
    );
  }

  public findSpecialOp(opsType: string, findPredicate: (ops: CmRichTextOp, index: number) => boolean): CmRichTextOp | undefined {
    return this.getSpecialOps(opsType).find(findPredicate);
  }

}
