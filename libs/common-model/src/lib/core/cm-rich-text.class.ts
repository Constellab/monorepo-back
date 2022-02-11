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
  url: string;
  title?: string;
  caption?: string;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}


export class CmRichText {

  constructor(private quillJson: CmRichTextI) {
  }

  /**
   * Get the list of figure in the json
   */
  public getFigures(): CmRichTextFigure[] {
    return this.quillJson.ops.filter(
      op => op.insert.figure !== null && typeof op.insert.figure === 'object',
    ).map(
      op => op.insert.figure
    );
  }

  public getFigure(filename: string): CmRichTextFigure {
    return this.getFigures().find(figure => figure.filename === filename);
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
}
