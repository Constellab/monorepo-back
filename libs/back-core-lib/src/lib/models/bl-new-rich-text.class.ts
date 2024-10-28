import { ClHelpService } from '@monorepo/core-lib';
import { JSDOM } from 'jsdom';
import { Logger } from '@nestjs/common';
import {
  BlRichTextBlockModification,
  BlRichTextModifications,
  BlRichTextModificationType
} from './bl-rich-text-block-modification.class';

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

export class BlRichTextContentWithModifications{
  content: BlRichTextContent;
  modifications: Record<string, any>;

  constructor(data: BlRichTextContent | BlRichTextContentWithModifications) {
    if(!(data as any)?.modifications) {
      this.content = data as BlRichTextContent;
      this.modifications = null;
    } else {
      this.content = (data as BlRichTextContentWithModifications)?.content;
      this.modifications = (data as BlRichTextContentWithModifications)?.modifications;
    }
  }
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
  RESOURCE_VIEW = 'resourceView',
  FILE_VIEW = 'fileView'
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


  ////////////////////////////////////////// MODIFICATIONS ///////////////////////////////////////////

  // Get the rich text modification has a string of the BlRichTextModifications object
  public getRichTextModificationAsString(newContent: BlRichTextContent,
                                         userId: string,
                                         modifications: BlRichTextModifications = new BlRichTextModifications()): string {
    return JSON.stringify(this.getRichTextModificationsAsObject(newContent, userId, modifications));
  }

  public getRichTextModificationsAsObject(newContent: BlRichTextContent,
                                          userId: string,
                                          modifications: BlRichTextModifications = new BlRichTextModifications()): Record<string, any>{
    const differences: BlRichTextBlockModification[] = [];
    if (this.richText == null || this.richText.blocks == null) {
      return null;
    }
    const oldBlocks = this.getBlocks();
    const oldBlockMap = new Map(oldBlocks.map(block => [block.id, block]));
    newContent.blocks.forEach((block, index) => {
      const oldBlock = oldBlockMap.get(block.id);
      const oldBlockIndex = oldBlocks.indexOf(oldBlock);
      if (oldBlock == null) { // block is new
        const modif = new BlRichTextBlockModification(
          block.id,
          block.type,
          BlRichTextModificationType.CREATED,
          index,
          userId
        );
        modif.blockValue = block.data;
        differences.push(modif);
      } else if (JSON.stringify(oldBlock) !== JSON.stringify(block)) { // block is updated
        const modif = new BlRichTextBlockModification(
          block.id,
          block.type,
          BlRichTextModificationType.UPDATED,
          index,
          userId
        );
        modif.blockValue = block.data;
        // get the differences between the old block data and the new block data,
        // we stringify the data to compare them as string with the lib diff
        modif.setDifferences(JSON.stringify(oldBlock.data));
        differences.push(modif);
        oldBlockMap.delete(block.id);
      } else if (oldBlockIndex != index && oldBlockMap.has(block.id)) { // block is moved
        const modif = new BlRichTextBlockModification(
          block.id,
          block.type,
          BlRichTextModificationType.MOVED,
          index,
          userId
        );
        modif.oldIndex = oldBlockIndex; // old index of the block
        modif.blockValue = block.data;
        differences.push(modif);
        oldBlockMap.delete(block.id);
      } else {
        oldBlockMap.delete(block.id);
      }
    });
    oldBlocks.forEach((oldBlock, index) => {
      if (oldBlockMap.has(oldBlock.id)) { // block is deleted
        const modif = new BlRichTextBlockModification(
          oldBlock.id,
          oldBlock.type,
          BlRichTextModificationType.DELETED,
          index,
          userId
        );
        modif.blockValue = oldBlock.data;
        differences.push(modif);
      }
    });

    modifications.fusion(differences);
    return modifications.toJsonObject();
  }

  // Undo the modifications in the modificationsList
  public undoModifications(modificationsList: BlRichTextBlockModification[]): BlRichTextContent {
    const content = this.getContent();

    if(!modificationsList || modificationsList.length == 0){
      return content;
    }

    const blocks = this.getBlocks();
    const reversedModifications = modificationsList.slice().reverse(); // Reverse to undo in the right order
    reversedModifications.forEach(modification => {
      switch (modification.type) {
        case BlRichTextModificationType.MOVED:
          const movedBlock: BlRichTextBlock = {
            id: modification.blockId,
            data: modification.blockValue,
            type: modification.blockType as any
          };
          // remove the block from the old index and add it to the new index
          blocks.splice(modification.index, 1);
          blocks.splice(modification.oldIndex, 0, movedBlock);
          break;
        case BlRichTextModificationType.CREATED:
          // remove the block from the index
          blocks.splice(modification.index, 1);
          break;
        case BlRichTextModificationType.UPDATED:
          // undo the differences in the block data and add anti-slashes to the double quotes
          const b = blocks.find(b => b.id === modification.blockId);
          const diff = modification.undoDifferences(JSON.stringify(b.data))
            .replace(/"/g, "\"");
          if (diff?.length > 0) {
            blocks[blocks.indexOf(b)].data = JSON.parse(diff);
          }
          break;
        case BlRichTextModificationType.DELETED:
          const block: BlRichTextBlock = {
            id: modification.blockId,
            data: modification.blockValue,
            type: modification.blockType as any
          }
          // add the block to the index
          blocks.splice(modification.index, 0, block);
          break;
      }
    });
    content.blocks = blocks;
    return content;
  }


  // Redo the modifications in the modificationsList
  public redoModifications(modificationsList: BlRichTextBlockModification[]): BlRichTextContent {
    const content = this.getContent();
    const blocks = this.getBlocks();
    modificationsList.forEach(modification => {
      switch (modification.type) {
        case BlRichTextModificationType.MOVED:
          const movedBlock: BlRichTextBlock = {
            id: modification.blockId,
            data: modification.blockValue,
            type: modification.blockType as any
          };
          blocks.splice(modification.oldIndex, 1);
          blocks.splice(modification.index, 0, movedBlock);
          break;
        case BlRichTextModificationType.CREATED:
          const block: BlRichTextBlock = {
            id: modification.blockId,
            data: modification.blockValue,
            type: modification.blockType as any
          }
          blocks.splice(modification.index, 0, block);
          break;
        case BlRichTextModificationType.UPDATED:
          const diff = modification.redoDifferences(JSON.stringify(blocks[modification.index].data))
            .replace(/"/g, "\"");
          if (diff?.length > 0) {
            blocks[modification.index].data = JSON.parse(diff);
          }
          break;
        case BlRichTextModificationType.DELETED:
          blocks.splice(modification.index, 1);
          break;
      }
    });
    content.blocks = blocks;
    return content;
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
