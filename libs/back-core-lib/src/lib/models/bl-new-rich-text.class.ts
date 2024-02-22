import {BlRichTextFigure} from './bl-rich-text.class';
import {ClHelpService} from '@monorepo/core-lib';

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

  public static isEmpty(content: BlRichTextContent): boolean {
    if (ClHelpService.isNullOrEmpty(content) || ClHelpService.isNullOrEmpty(content.blocks)) return true;

    // check if all block are paragraph and contain only spaces or empty string
    const allParagraph = content.blocks.every(block => block.type === BlBlockType.PARAGRAPH);
    if (!allParagraph) return false;

    return content.blocks.every(block => {
      return ClHelpService.isNullOrEmpty(block.data) || ClHelpService.isNullOrEmpty(block.data.text) ||
        ClHelpService.isNullOrEmpty(block.data.text.trim());
    });
  }

  constructor(private richText: BlRichTextContent) {
  }

  public getBlocks(): BlOutputBlockData[] {
    return this.richText.blocks;
  }

  public getBlocksByType(type: BlBlockType): BlOutputBlockData[] {
    return this.richText?.blocks?.filter(block => block.type === type);
  }

  public getContent(): BlRichTextContent {
    return this.richText;
  }

  ////////////////////////////////////// PARAGRAPH ///////////////////////////////////////////////
  public getParagraphsBlocks(): BlOutputBlockData[] {
    return this.getBlocksByType(BlBlockType.PARAGRAPH);
  }

  public getFirstParagraphsText(): string {
    if (BlNewRichText.isEmpty(this.getContent())) return null;
    let result = '';
    const paragraphBlocks = this.getContent().blocks.filter(block => block.type === BlBlockType.PARAGRAPH);
    if (paragraphBlocks.length === 0) return null;
    for (const block of paragraphBlocks) {

      if (block.data && block.data.text && block.data.text.trim() !== ''){
        if (result.length + block.data.text.trim().length > 200){
          result += block.data.text.trim().substring(0, 200 - result.length) + '...';
          break;
        }
        result += block.data.text.trim() + ' ';
      }
    }
    return result.replace(/<[^>]*>/g, '');
  }

  ///////////////////////////////////// FIGURE ///////////////////////////////////////////////

  public getFiguresBlocks(): BlOutputBlockData[] {
    return this.getBlocksByType(BlBlockType.FIGURE);
  }

  public isUsedFigure(filename: string): boolean {
    return this.getFiguresBlocks().some(op => op.data.filename === filename);
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
