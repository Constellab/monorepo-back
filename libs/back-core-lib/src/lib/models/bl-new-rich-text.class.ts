import {BlRichTextFigure} from './bl-rich-text.class';

/**
 * Types taken from @editorjs/editorjs
 */
export interface BlOutputBlockData<Data extends object = any> {
  /**
   * Unique Id of the block
   */
  id?: string;
  /**
   * Tool type
   */
  type: BlBlockType;
  /**
   * Saved Block data
   */
  data: Data;

}

export interface BlOutputData {
  /**
   * Editor's version
   */
  version?: string;

  /**
   * Timestamp of saving in milliseconds
   */
  time?: number;

  /**
   * Saved Blocks
   */
  blocks: BlOutputBlockData[];
}

export type BlRichTextContent = BlOutputData;

export enum BlBlockType {
  PARAGRAPH = 'paragraph',
  FIGURE = 'figure',
  RESOURCE_VIEW = 'resourceView'
}

export class BlNewRichText {

  public static emptyContent(): BlRichTextContent {
    return {
      time: new Date().getTime(),
      blocks: [],
      version: '2.28.2'
    };
  }

  constructor(private richText: BlRichTextContent) {
  }

  public getBlocks(): BlOutputBlockData[] {
    return this.richText.blocks;
  }

  public getBlocksByType(type: BlBlockType): BlOutputBlockData[] {
    return this.richText.blocks.filter(block => block.type === type);
  }

  public getContent(): BlRichTextContent {
    return this.richText;
  }

  ////////////////////////////////////// PARAGRAPH ///////////////////////////////////////////////
  public getParagraphsBlocks(): BlOutputBlockData[] {
    return this.getBlocksByType(BlBlockType.PARAGRAPH);
  }

  public getFirstParagraphText(): string {
    const paragraph = this.getParagraphsBlocks()[0];
    if (paragraph == null) return null;
    return this.removeBaliseFromText(paragraph.data.text);
  }

  private removeBaliseFromText(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }

  ///////////////////////////////////// FIGURE ///////////////////////////////////////////////

  public getFiguresBlocks(): BlOutputBlockData[] {
    return this.getBlocksByType(BlBlockType.FIGURE);
  }

  public getFirstFigureLink(): string {
    const figure = this.getFiguresBlocks()[0];
    if (figure == null) return null;
    return figure.data.filename;
  }

  public getFiguresBlock(filename: string): BlOutputBlockData | undefined {
    return this.getFiguresBlocks().find(op => op.data.filename === filename) ?? null;
  }

  public updateFigureBlock(filename: string, figure: Partial<BlRichTextFigure>): void {
    const figureBlock = this.getFiguresBlock(filename);

    if (figureBlock == null) return;

    figureBlock.data = Object.assign(figureBlock.data, figure);

  }

}
