export interface CmRichTextI {
  ops: {
    insert: any
  }[];
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


export class CmRichText {

  constructor(private richText: CmRichTextI) {
  }

  /**
   * Get the list of figure in the json
   */
  public getFigures(): CmRichTextFigure[] {
    return this.richText.ops.filter(
      op => op.insert.figure !== null && typeof op.insert.figure === 'object',
    ).map(
      op => op.insert.figure
    );
  }

  public getFigure(filename: string): CmRichTextFigure {
    return this.getFigures().find(figure => figure.filename === filename);
  }

  public getHeaders(headersSize: number[]): any[]{
    const headers: any[] = [];
    const contentData: any[] = this.getContent().ops;
    console.log('CD', contentData)
    contentData.forEach((c, i) => {
      if(contentData[i+1] && contentData[i+1].attributes && contentData[i+1].attributes.header
        && (headersSize.includes(contentData[i+1].attributes.header))){
        const inserts: string[] = c.insert.split('\n')
        if(inserts.length > 1) headers.push([contentData[i+1].attributes.header, inserts[inserts.length -1]]);
        else headers.push([contentData[i+1].attributes.header, c.insert]);
      }
    });
    return headers;
  }

  /**
   * Update the figure with the name
   * @param filename
   * @param figure
   */
  public updateFigure(filename: string, figure: Partial<CmRichTextFigure>): void {
    const oldFigure = this.getFigure(filename);

    if (oldFigure == null) return;

    Object.assign(oldFigure, figure);
  }

  public getContent(): CmRichTextI {
    return this.richText;
  }
}
