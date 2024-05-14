export interface BlRichTextI {
  ops: BlRichTextOp[];
}

export interface BlRichTextOp {
  insert: any;
  attributes?: any;
}

/**
 * Required information for a new upload image
 */
export interface BlRichTextUploadedImage {
  filename: string;
  width: number;
  height: number;
}

/**
 * Object representing the value stored to create a figure
 */
export interface BlRichTextFigure {
  filename: string;
  title?: string;
  caption?: string;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}


export interface BlRichTextFigureOp extends BlRichTextOp {
  insert: {
    figure: BlRichTextFigure
  };
}



export class BlRichText {


  private static readonly figureOps = 'figure';

  constructor(private richText: BlRichTextI) {


  }

  public static newRichText(): BlRichTextI {
    return {ops: []};
  }

  public static getOptimisedContent(content: BlRichTextI): BlRichTextI {
    if (content.ops[0] && !content.ops[0].attributes && content.ops[0].insert &&
      (typeof content.ops[0].insert === 'string' || content.ops[0].insert instanceof String)) {
      content.ops[0].insert = content.ops[0].insert.replace(/^\s+|/g, '');
    }

    const lengthOps = content.ops.length;

    if (content.ops[lengthOps - 1] && content.ops[lengthOps - 1].insert && !content.ops[lengthOps - 1].attributes &&
      (typeof content.ops[lengthOps - 1].insert === 'string' || content.ops[lengthOps - 1].insert instanceof String)) {
      content.ops[lengthOps - 1].insert = content.ops[lengthOps - 1].insert.replace(/\s+$/g, '');
    }
    return content;
  }



  public static getMentions(content: BlRichTextI): string[] {
    const mentions: string[] = [];
    const contentData: any[] = content.ops;
    if (contentData != null) {
      contentData.forEach((c) => {
        if (c.insert && c.insert.mention) {
          mentions.push(c.insert.mention.id);
        }
      });
    }
    return mentions;
  }



  ///////////////////////////////////// FIGURE ///////////////////////////////////////////////

  public getFiguresOps(): BlRichTextFigureOp[] {
    return this.getSpecialOps(BlRichText.figureOps);
  }

  ///////////////////////////////////// SPECIAL OPS ///////////////////////////////////////////////


  public getSpecialOps(opsType: string): BlRichTextOp[] {
    return this.richText.ops.filter(
      op => op.insert[opsType] !== null && typeof op.insert[opsType] === 'object',
    );
  }
}
