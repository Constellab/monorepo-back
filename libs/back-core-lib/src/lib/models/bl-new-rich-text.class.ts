import {ClHelpService} from '@monorepo/core-lib';
import {JSDOM} from 'jsdom';
import {Logger} from '@nestjs/common';

/**
 * Types taken from @editorjs/editorjs
 */
export interface BlRichTextBlock<Data extends object = any> {
  /**
   * Unique id of the block
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

export interface BlRichTextContent {
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
  blocks: BlRichTextBlock[];
}

export enum BlBlockType {
  PARAGRAPH = 'paragraph',
  FIGURE = 'figure',
  RESOURCE_VIEW = 'resourceView'
}

export enum BlInlineToolType {
  MENTION = 'te-mention-inline'
}

export interface BlMentionUser {
  id: string;
  firstname: string;
  lastname: string;
}

export interface BlFigureBlockData {
  caption: string;
  filename: string;
  title: string;
  height: number;
  width: number;
  naturalHeight: number;
  naturalWidth: number;
}

/**
 * Required information for a new upload image
 */
export interface BlRichTextUploadedImageResponse {
  filename: string;
  width: number;
  height: number;
}

export interface BlRichTextUploadFileResponse {
  name: string;
  size: number; // in bytes
}

export class BlNewRichText {

  private readonly logger = new Logger(BlNewRichText.name);


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

  public static generateRandomBlockId(): string {
    // return a random string of 10 characters containing only letters and numbers and underscore
    return Math.random().toString(36).substring(2, 12);
  }

  constructor(private richText: BlRichTextContent) {
  }

  public getBlocks(): BlRichTextBlock[] {
    return this.richText.blocks;
  }

  public getBlocksByType(type: BlBlockType): BlRichTextBlock[] {
    return this.richText?.blocks?.filter(block => block.type === type);
  }

  public getContent(): BlRichTextContent {
    return this.richText;
  }

  ////////////////////////////////////// PARAGRAPH ///////////////////////////////////////////////
  public getParagraphsBlocks(): BlRichTextBlock[] {
    return this.getBlocksByType(BlBlockType.PARAGRAPH);
  }

  public getFirstParagraphsText(): string {
    if (BlNewRichText.isEmpty(this.getContent())) return null;
    let result = '';
    const paragraphBlocks = this.getContent().blocks.filter(block => block.type === BlBlockType.PARAGRAPH);
    if (paragraphBlocks.length === 0) return null;
    for (const block of paragraphBlocks) {

      if (block.data && block.data.text && block.data.text.trim() !== '') {
        if (result.length + block.data.text.trim().length > 200) {
          result += block.data.text.trim().substring(0, 200 - result.length) + '...';
          break;
        }
        result += block.data.text.trim() + ' ';
      }
    }
    return result.replace(/<[^>]*>/g, '');
  }

  ///////////////////////////////////// FIGURE ///////////////////////////////////////////////

  public getFiguresBlocks(): BlRichTextBlock<BlFigureBlockData>[] {
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

  public getFiguresBlock(filename: string): BlRichTextBlock | undefined {
    return this.getFiguresBlocks().find(op => op.data.filename === filename) ?? null;
  }

  ///////////////////////////////////// MENTION ///////////////////////////////////////////////


  public getMentions(): BlMentionUser[] {
    const mentions: BlMentionUser[] = [];
    for (const block of this.getBlocks()) {
      const htmlData = JSON.stringify(block.data);

      // retrieve all the element te-mention-inline inside htmlData then read the data-jsondata attribute as json
      // using jsdom
      const mentionElement = new JSDOM(`<!DOCTYPE html>${htmlData}`);
      const mentionElements = mentionElement.window.document.querySelectorAll(BlInlineToolType.MENTION);
      for (const element of mentionElements) {
        const attribute = element.getAttribute('data-jsondata');
        try {
          // replace all '"/' by '' to avoid parsing error
          const json = JSON.parse(attribute.replace(/\\"/g, ''));
          mentions.push(json);
        } catch (e) {
          this.logger.error(`Error parsing mention: ${attribute}. Error message: ${e}`);
        }
      }
    }

    return mentions;
  }
}
