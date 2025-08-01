import { ClHelpService } from '@monorepo/core-lib';

import {
  TeBlock,
  TeBlockFigureData,
  TeBlockFileViewData,
  TeBlockHeaderData,
  TeBlockHeaderLevel,
  TeBlockType,
  TeBlockViewData,
} from './te-block.class';
import { TeMarkdown } from './te-markdown.class';
import { TeRichTextMigrator } from './te-rich-text-migrator.class';

/**
 * JSON of the HTMLEditor
 */
export interface TeHTMLEditorJSON {
  /**
   * Editor's version
   */
  version: string;

  /**
   * Timestamp of saving in milliseconds
   */
  time: number;

  /**
   * Saved Blocks
   */
  blocks: TeBlock[];
}

export interface TeRichTextDTO {
  version: number;
  editorVersion: string;
  blocks: TeBlock[];
}

/**
 * Input for the TeRichText class
 * It supports both the old and new format
 */
export type TeRichTextInput = TeHTMLEditorJSON | TeRichTextDTO;

export class TeRichText {
  private static readonly CURRENT_VERSION = 2;
  private static readonly CURRENT_EDITOR_VERSION = '2.30.2';

  public readonly version: number;
  public readonly editorVersion: string;

  private readonly blocks: TeBlock[];

  public static emptyJson(): TeRichTextDTO {
    return {
      blocks: [],
      version: TeRichText.CURRENT_VERSION,
      editorVersion: TeRichText.CURRENT_EDITOR_VERSION,
    };
  }

  public static fromHTMLEditorJson(content: TeHTMLEditorJSON): TeRichText {
    return new TeRichText({
      blocks: content.blocks,
      version: TeRichText.CURRENT_VERSION,
      editorVersion: content.version.toString(),
    });
  }

  public isEmpty(): boolean {
    if (ClHelpService.isNullOrEmpty(this.blocks)) return true;

    // check if all block are paragraph and contain only spaces or empty string
    const allParagraph = this.blocks.every((block) => block.type === TeBlockType.PARAGRAPH);
    if (!allParagraph) return false;

    return this.blocks.every((block) => {
      return (
        ClHelpService.isNullOrEmpty(block.data) ||
        ClHelpService.isNullOrEmpty(block.data.text) ||
        ClHelpService.isNullOrEmpty(block.data.text.trim())
      );
    });
  }

  public contentAreEquals(other: TeRichText): boolean {
    if (other == null) return false;
    if (this === other) return true;
    if (this.version !== other.version) return false;
    if (this.blocks.length !== other.blocks.length) return false;
    return JSON.stringify(this.blocks) === JSON.stringify(other.blocks);
  }

  public static generateRandomBlockId(): string {
    // return a random string of 10 characters containing only letters and numbers and underscore
    return Math.random().toString(36).substring(2, 12);
  }

  constructor(richText: TeRichTextInput = null, targetVersion: number = TeRichText.CURRENT_VERSION) {
    let newRichText: TeRichTextDTO;
    const content: any = richText;
    if (content == null) {
      newRichText = TeRichText.emptyJson();
    } else if (content.time != null) {
      // convert the TeHTMLEditorJSON to TeRichTextDTO
      const htmlContent: TeHTMLEditorJSON = content;
      newRichText = {
        version: 1,
        editorVersion: htmlContent.version,
        blocks: htmlContent.blocks,
      };
    } else {
      newRichText = richText as TeRichTextDTO;
    }

    newRichText = this.migrate(newRichText, targetVersion);
    this.version = newRichText.version;
    this.editorVersion = newRichText.editorVersion;
    this.blocks = newRichText.blocks;
  }

  private migrate(content: TeRichTextDTO, targetVersion: number): TeRichTextDTO {
    const migrators = TeRichTextMigrator.getMigrators(content.version, targetVersion);
    for (const migrator of migrators) {
      content = migrator.migrateRichText(content);
    }
    return content;
  }

  public getBlocks(): TeBlock[] {
    return this.blocks;
  }

  public getBlocksByType(type: TeBlockType): TeBlock[] {
    return this.blocks?.filter((block) => block.type === type);
  }

  ////////////////////////////////////// PARAGRAPH ///////////////////////////////////////////////
  public getParagraphsBlocks(): TeBlock[] {
    return this.getBlocksByType(TeBlockType.PARAGRAPH);
  }

  public getFirstParagraphsText(): string {
    if (this.isEmpty()) return null;
    let result = '';
    const paragraphBlocks = this.blocks.filter((block) => block.type === TeBlockType.PARAGRAPH);
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

  ///////////////////////////////////// HEADER ///////////////////////////////////////////////
  public getHeadersData(titleTypes: TeBlockHeaderLevel[]): TeBlockHeaderData[] {
    const titleBlocks = this.blocks.filter(
      (block) => block.type === TeBlockType.HEADER && titleTypes.includes(block.data.level)
    );

    return titleBlocks.map((block) => {
      block.data.text = block.data.text
        .trim()
        .replace('&nbsp;', '')
        .replace('&amp;', '&')
        .replace('&lt;', '<')
        .replace('&gt;', '>');
      return block.data;
    });
  }

  ///////////////////////////////////// FIGURE ///////////////////////////////////////////////

  public getFiguresBlocks(): TeBlock<TeBlockFigureData>[] {
    return this.getBlocksByType(TeBlockType.FIGURE);
  }

  public isUsedFigure(filename: string): boolean {
    return this.getFiguresBlocks().some((op) => op.data.filename === filename);
  }

  public getFirstFigureLink(): string {
    const figure = this.getFiguresBlocks()[0];
    if (figure == null) return null;
    return figure.data.filename;
  }

  public getFiguresBlock(filename: string): TeBlock | undefined {
    return this.getFiguresBlocks().find((op) => op.data.filename === filename) ?? null;
  }

  public getResourceViewsBlocks(): TeBlock<TeBlockViewData>[] {
    return this.getBlocksByType(TeBlockType.RESOURCE_VIEW);
  }

  public getFileViewsBlocks(): TeBlock<TeBlockFileViewData>[] {
    return this.getBlocksByType(TeBlockType.FILE_VIEW);
  }

  public hasBlock(id: string): boolean {
    return this.getBlock(id) != null;
  }

  public getBlock(id: string): TeBlock {
    return this.blocks.find((block) => block.id === id);
  }

  public getBlockIndex(id: string): number {
    return this.blocks.findIndex((block) => block.id === id);
  }

  public toJson(): TeRichTextDTO {
    return {
      version: this.version,
      editorVersion: this.editorVersion,
      blocks: this.blocks,
    };
  }

  public toHTMLEditorJson(): TeHTMLEditorJSON {
    return {
      version: this.editorVersion,
      time: Date.now(),
      blocks: this.blocks,
    };
  }

  ///////////////////////////////////// MARKDOWN ///////////////////////////////////////////////
  public toMarkdown(imageUrlPrefix: string = '', textEditorUrlPage: string = null): string {
    let result = '';
    for (const block of this.blocks) {
      switch (block.type) {
        case TeBlockType.PARAGRAPH:
          result += TeMarkdown.getParagraphBlockMarkdown(block.data.text) + '\n\n';
          break;
        case TeBlockType.HEADER:
          result += TeMarkdown.getHeaderBlockMarkdown(block.data, textEditorUrlPage) + '\n\n';
          break;
        case TeBlockType.LIST:
          result += TeMarkdown.getListBlockDataMarkdown(block.data) + '\n\n';
          break;
        case TeBlockType.FIGURE:
          result += TeMarkdown.getImageBlockMarkdown(block.data, imageUrlPrefix) + '\n\n';
          break;
        case TeBlockType.CODE:
          result += TeMarkdown.getCodeBlockMarkdown(block.data) + '\n\n';
          break;
        case TeBlockType.HINT:
          result += TeMarkdown.getHintBlockMarkdown(block.data) + '\n\n';
          break;
        default:
          break;
      }
    }
    return result;
  }
}
