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
} from './te-block.class';

export class TeMarkdown {
  // This class is used to convert string with html tags to markdown
  public static getParagraphBlockMarkdown(text: string): string {
    return NodeHtmlMarkdown.translate(text);
  }

  // This class is used to convert header block data to markdown with header metadata
  public static getHeaderBlockMarkdown(
    headerBlockData: TeBlockHeaderData,
    textEditorUrlPage: string = null
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
    return `${codeBlock}${codeBlockData.code}${codeBlock}`;
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
      result += `${'    '.repeat(level)}${listIndexStr} ${this.getParagraphBlockMarkdown(listBlockItem.content)}\n`;
      if (listBlockItem.items.length > 0) {
        result += this.getListBlockItemsMarkdown(listBlockItem.items, style, level + 1);
      }
    }
    return result;
  }
}
