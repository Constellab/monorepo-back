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


export interface BlRichTextLink {
  attributes: BlRichTextTitleAttribute;
  insert: string;
}


export interface BlRichTextHeader {
  attributes: BlRichTextHeaderAttribute;
  insert: string;
}

export interface BlRichTextHeaderAttribute {
  header: BlRichTextHeaderConfig;
}

export interface BlRichTextHeaderConfig {
  level: number;
  id?: string;
}


export interface BlRichTextTitleAttribute {
  link: string;
  id?: string;
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

  public static getLinks(content: BlRichTextI): BlRichTextLink[] {
    const titles: BlRichTextLink[] = [];
    const contentData: any[] = content.ops;
    if (contentData != null) {
      contentData.forEach((c) => {
        if (c.attributes && c.insert && c.attributes.link) {
          titles.push(c as BlRichTextLink);
        }
      });
    }
    return titles;
  }

  public static getHeaders(content: BlRichTextI): BlRichTextHeader[] {
    const headers: BlRichTextHeader[] = [];
    const contentData: any[] = content.ops;
    if (contentData) {
      contentData.forEach((c) => {
        if (c.attributes && c.insert && c.attributes.header) {
          headers.push(c);
        }
      });
    }
    return headers;
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

  public static modifyFigureInContent(content: BlRichTextI, filename: string, newFilename: string): BlRichTextI {
    const contentData: any[] = content.ops;

    if (contentData != null) {
      contentData.forEach((c) => {
        if (c.insert && c.insert.figure && c.insert.figure.filename === filename) {
          c.insert.figure.filename = newFilename;
        }
      });
    }

    return content;
  }

  public getContent(): BlRichTextI {
    return this.richText;
  }


  // Get the first paragraph of the content
  public getFirstParagraph(size: number = 100): string {
    const content: BlRichTextI = this.getContent();
    let firstParagraph = '';
    if (content.ops) {
      for (const op of content.ops) {
        if (op.insert) {
          if (typeof op.insert === 'string' || op.insert instanceof String) {
            if (firstParagraph.length < size) {
              firstParagraph += op.insert;
            } else {
              break;
            }
          }
        }

      }
    }
    return firstParagraph.slice(0, size);
  }

  // Get the first figure link of the content
  public getFirstFigureLink(): string {
    const content: BlRichTextI = this.getContent();
    let firstPictureLink = '';
    if (content.ops) {
      for (const op of content.ops) {
        if (op.insert && op.insert.figure && op.insert.figure.filename) {
          firstPictureLink = op.insert.figure.filename;
          break;
        }
      }
    }
    return firstPictureLink;
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

  public findSpecialOp(opsType: string, findPredicate: (ops: BlRichTextOp, index: number) => boolean): BlRichTextOp | undefined {
    return this.getSpecialOps(opsType).find(findPredicate);
  }

}
