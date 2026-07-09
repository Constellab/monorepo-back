import { ClStringHelper } from '@monorepo/core-lib';
import { NodeHtmlMarkdown } from 'node-html-markdown';

import {
  TeBlockData,
  TeBlockFigureData,
  TeBlockHeaderData,
  TeBlockListData,
  TeBlockListItem,
  TeBlockListType,
  TeBlockTableData,
  TeBlockType,
} from './lib/te-block.class';
import { TeRichText } from './lib/te-rich-text.class';

export class TeMarkdown {
  // Convert a rich text document to markdown.
  // Lives here (outside the shared `lib/` folder) because it depends on `node-html-markdown`,
  // a back-only dependency we don't want to ship to the front repo.
  public static fromRichText(
    richText: TeRichText,
    imageUrlPrefix: string = '',
    textEditorUrlPage: string | null = null
  ): string {
    let result = '';
    for (const block of richText.getBlocks()) {
      switch (block.type) {
        case TeBlockType.PARAGRAPH:
          result += this.getParagraphBlockMarkdown(block.data.text) + '\n\n';
          break;
        case TeBlockType.HEADER:
          result += this.getHeaderBlockMarkdown(block.data, textEditorUrlPage) + '\n\n';
          break;
        case TeBlockType.LIST:
          result += this.getListBlockDataMarkdown(block.data) + '\n\n';
          break;
        case TeBlockType.FIGURE:
          result += this.getImageBlockMarkdown(block.data, imageUrlPrefix) + '\n\n';
          break;
        case TeBlockType.CODE:
          result += this.getCodeBlockMarkdown(block.data) + '\n\n';
          break;
        case TeBlockType.HINT:
          result += this.getHintBlockMarkdown(block.data) + '\n\n';
          break;
        case TeBlockType.TABLE:
          result += this.getTableBlockMarkdown(block.data) + '\n\n';
          break;
        default:
          break;
      }
    }
    return result;
  }

  // This class is used to convert string with html tags to markdown
  public static getParagraphBlockMarkdown(text: string): string {
    return NodeHtmlMarkdown.translate(text);
  }

  // This class is used to convert header block data to markdown with header metadata
  public static getHeaderBlockMarkdown(
    headerBlockData: TeBlockHeaderData,
    textEditorUrlPage: string | null = null
  ): string {
    let res = `${'#'.repeat(headerBlockData.level)} ${headerBlockData.text}`;
    // Add metadata to the header block
    if (headerBlockData.metadata || textEditorUrlPage) {
      res += '\n<!-- \n';
      if (textEditorUrlPage) {
        res += `source_url: "${textEditorUrlPage}#${ClStringHelper.getCleanUrlPath(headerBlockData.text)}"\n`;
      }
      if (headerBlockData.metadata?.appRoute) {
        res += `app_route: "${headerBlockData.metadata.appRoute}"\n`;
      }
      if (headerBlockData.metadata?.permission) {
        res += `permission: "${headerBlockData.metadata.permission}"\n`;
      }
      res += '-->';
    }
    return res;
  }

  // This class is used to convert list block data to markdown
  public static getListBlockDataMarkdown(listBlockData: TeBlockListData): string {
    return this.getListBlockItemsMarkdown(listBlockData.items, listBlockData.style);
  }

  // This class is used to convert figure block data to markdown
  public static getImageBlockMarkdown(
    figureBlockData: TeBlockFigureData,
    imageUrlPrefix: string = ''
  ): string {
    let imageLink = figureBlockData.filename;
    if (!ClStringHelper.isHttpLink(imageLink)) {
      imageLink = `${imageUrlPrefix}/${imageLink}`;
    }
    return `![${figureBlockData.caption}](${imageLink})`;
  }

  // This class is used to convert code block data to markdown
  public static getCodeBlockMarkdown(codeBlockData: TeBlockData): string {
    const codeBlock = '```';
    return `${codeBlock}\n${codeBlockData.code}\n${codeBlock}\n`;
  }

  // This class is used to convert hint block data to markdown
  public static getHintBlockMarkdown(hintBlockData: TeBlockData): string {
    return `> ${this.getParagraphBlockMarkdown(hintBlockData.content)}`;
  }

  // This class is used to convert table block data to markdown
  public static getTableBlockMarkdown(tableBlockData: TeBlockTableData): string {
    const rows = tableBlockData.content;
    if (!rows || rows.length === 0) return '';

    let result = '';
    const startIndex = tableBlockData.withHeadings ? 1 : 0;

    if (tableBlockData.withHeadings) {
      const headerRow = rows[0];
      result += '| ' + headerRow.map((cell) => this.getParagraphBlockMarkdown(cell)).join(' | ') + ' |\n';
      result += '| ' + headerRow.map(() => '---').join(' | ') + ' |\n';
    } else {
      // No headings: generate an empty header row for valid markdown table
      const colCount = rows[0].length;
      result += '| ' + new Array(colCount).fill('').join(' | ') + ' |\n';
      result += '| ' + new Array(colCount).fill('---').join(' | ') + ' |\n';
    }

    for (let i = startIndex; i < rows.length; i++) {
      result += '| ' + rows[i].map((cell) => this.getParagraphBlockMarkdown(cell)).join(' | ') + ' |\n';
    }

    return result.trimEnd();
  }

  // This class is used to convert list block items to markdown recursively
  private static getListBlockItemsMarkdown(
    items: TeBlockListItem[],
    style: TeBlockListType,
    level: number = 0
  ): string {
    let result = '';
    for (let index = 0; index < items.length; index++) {
      const listBlockItem = items[index];
      const listIndexStr = style === 'ordered' ? `${index + 1}.` : '-';
      result += `${'    '.repeat(level)}${listIndexStr} ${this.getParagraphBlockMarkdown(
        listBlockItem.content
      )}\n`;
      if (listBlockItem.items.length > 0) {
        result += this.getListBlockItemsMarkdown(listBlockItem.items, style, level + 1);
      }
    }
    return result;
  }
}
