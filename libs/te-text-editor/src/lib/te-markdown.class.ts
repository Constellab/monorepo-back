import {
  TeBlockData,
  TeBlockFigureData,
  TeBlockHeaderData,
  TeBlockListData,
  TeBlockListItem,
  TeBlockListType,
} from './te-block.class';
import { ClStringHelper } from '@monorepo/core-lib';
import { NodeHtmlMarkdown } from 'node-html-markdown';

export class TeMarkdown {
  public static getParagraphBlockMarkdown(text: string): string {
    return NodeHtmlMarkdown.translate(text);
  }

  public static getHeaderBlockMarkdown(
    headerBlockData: TeBlockHeaderData,
    textEditorUrlPage: string = null
  ): string {
    let res = `${'#'.repeat(headerBlockData.level)} ${headerBlockData.text}`;
    if (textEditorUrlPage) {
      res += `\n<!-- \nsource_url: "${textEditorUrlPage}#${ClStringHelper.getCleanUrlPath(headerBlockData.text)}"\n-->`;
    }
    return res;
  }

  public static getListBlockDataMarkdown(listBlockData: TeBlockListData): string {
    return this.getListBlockItemsMarkdown(listBlockData.items, listBlockData.style);
  }

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

  public static getCodeBlockMarkdown(codeBlockData: TeBlockData): string {
    let codeBlock = '```';
    return `> ${codeBlock}${codeBlockData.code}${codeBlock}`;
  }

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
