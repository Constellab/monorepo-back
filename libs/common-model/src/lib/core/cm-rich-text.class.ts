import {ClHelpService} from '@monorepo/core-lib';

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

/**
 * Object representing the value stored to create a video
 */
export interface CmRichTextVideo {
  url: string;
  title?: string;
  caption?: string;
}

export interface CmRichTextFigureOp extends CmRichTextOp {
  insert: {
    figure: CmRichTextFigure
  };
}


export interface CmRichTextLink {
  attributes: CmRichTextTitleAttribute;
  insert: string;
}

/**
 * Object representing the value stored to create a formula
 */
export interface CmRichTextFormula {
  formula: string;
  title?: string;
  caption?: string;
}

export interface CmRichTextHeader {
  attributes: CmRichTextHeaderAttribute;
  insert: string;
}

export interface CmRichTextHeaderAttribute {
  header: CmRichTextHeaderConfig;
}

export interface CmRichTextHeaderConfig {
  level: number;
  id?: string;
}

export interface CmRichTextImageCP {
  insert: CmRichTextInsertImage | CmRichTextInsertFigure;
}

export interface CmRichTextInsertImage {
  image: string;
}

export interface CmRichTextInsertFigure {
  figure: CmRichTextFigure
}

export interface CmRichTextTitleAttribute {
  link: string;
  id?: string;
}


export class CmRichText {


  private static readonly figureOps = 'figure';

  constructor(private richText: CmRichTextI) {


  }

  public static newRichText(): CmRichTextI {
    return {ops: []};
  }

  public static getOptimisedContent(content: CmRichTextI): CmRichTextI{
    if(content.ops[0] && !content.ops[0].attributes && content.ops[0].insert &&
      (typeof content.ops[0].insert === 'string' || content.ops[0].insert instanceof String)){
      content.ops[0].insert = content.ops[0].insert.replace(/^\s+|/g, '');
    }

    const lengthOps = content.ops.length;

    if(content.ops[lengthOps-1] && content.ops[lengthOps-1].insert && !content.ops[lengthOps-1].attributes &&
      (typeof content.ops[lengthOps-1].insert === 'string' || content.ops[lengthOps-1].insert instanceof String)){
      content.ops[lengthOps-1].insert = content.ops[lengthOps-1].insert.replace(/\s+$/g, '');
    }
    return content;
  }

  public static getLinks(content: CmRichTextI): CmRichTextLink[] {
    const titles: CmRichTextLink[] = [];
    const contentData: any[] = content.ops;
    if (contentData != null) {
      contentData.forEach((c) => {
        if (c.attributes && c.insert && c.attributes.link) {
          titles.push(c as CmRichTextLink);
        }
      });
    }
    return titles;
  }

  public static getHeaders(content: CmRichTextI): CmRichTextHeader[] {
    const headers: CmRichTextHeader[] = [];
    const contentData: any[] = content.ops;
    if (contentData) {
      contentData.forEach((c) => {
        if (c.attributes && c.insert && c.attributes.header) {
          headers.push(c);
        }
      })
    }
    return headers;
  }

  public static getImageCP(content: CmRichTextI): CmRichTextImageCP[] {
    const imgs: CmRichTextImageCP[] = [];
    const contentData: any[] = content.ops;
    if (contentData != null) {
      contentData.forEach((c) => {
        if (c.insert && c.insert.image) {
          const imgLink: string = c.insert.image;
          if (imgLink.startsWith('data:image/')) {
            imgs.push(c);
          }
        }
      })
    }
    return imgs;
  }

  public static isEmpty(content: CmRichTextI): boolean{
    let isEmpty = true;
    if (!ClHelpService.isNullOrEmpty(content) && content.ops) {
      for(const op of content.ops){
        if(op.insert && (op.insert.length > 0 && !(/^\s*$/.test(op.insert)) || op.insert.figure)){
          isEmpty = false;
        }
      }
    }
    return isEmpty;
  }

  public static addEmoji(content: CmRichTextI, emoji: string): CmRichTextI {
    if(this.isEmpty(content)){
      content.ops = [{insert: emoji}];
    } else {
      if(content.ops[content.ops.length-1].insert && (typeof content.ops[content.ops.length-1].insert === 'string' ||
        content.ops[content.ops.length-1].insert instanceof String)){
        let insert = content.ops[content.ops.length-1].insert;
        if(insert.endsWith('\n')){
          insert = insert.substring(0, insert.length-1);
        }
        content.ops[content.ops.length-1].insert = insert + emoji;
      } else {
        content.ops.push({insert: emoji});
      }
    }
    return content;
  }

  public getContent(): CmRichTextI {
    return this.richText;
  }

  public getHeaders(headersSize: number[]): any[] {
    const headers: any[] = [];
    const contentData: any[] = this.getContent().ops;
    if (contentData != null) {
      const listId: string[] = [];
      contentData.forEach((c, i) => {
        if (contentData[i + 1] && contentData[i + 1].attributes && contentData[i + 1].attributes.header
          && (headersSize.includes(contentData[i + 1].attributes.header.level))) {
          const inserts: string[] = c.insert.split('\n');

          if (contentData[i + 1].attributes.header.id) {

            contentData[i + 1].attributes.header.id =
              contentData[i + 1].attributes.header.id.replace(new RegExp(/[&?~/|\\'"[()\]%!§:;.,*^¨}{@°`]/g), '');

            if (contentData[i + 1].attributes.header.id.length > 0) {
              const nbSame: number = listId.filter(value => value == contentData[i + 1].attributes.header.id).length;
              if (nbSame > 0)
                contentData[i + 1].attributes.header.id = contentData[i + 1].attributes.header.id + nbSame;
              listId.push(contentData[i + 1].attributes.header.id);
            } else {
              delete contentData[i + 1].attributes.header.id;
            }
          }


          if (inserts.length > 1) {
            headers.push({
              level: contentData[i + 1].attributes.header.level,
              id: contentData[i + 1].attributes.header.id ?? null,
              title: inserts[inserts.length - 1]
            });
          } else headers.push({
            level: contentData[i + 1].attributes.header.level,
            id: contentData[i + 1].attributes.header.id ?? null,
            title: c.insert
          });

        }
      });
    }
    return headers;
  }


  // Get the first paragraph of the content
  public getFirstParagraph(size:number=100): string {
    const content: CmRichTextI = this.getContent();
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
    const content: CmRichTextI = this.getContent();
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
