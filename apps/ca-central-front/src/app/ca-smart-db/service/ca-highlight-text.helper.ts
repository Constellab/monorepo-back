import {ClStringHelper} from '@monorepo/core-lib';


export class CaHighlightTextHelper {

  public static highlightTextFromPosition(text: string, offset: number, length: number): string {
    const highlightValue = text.substr(offset, length);
    return ClStringHelper.replaceAt(text, offset, length,
      `<mark>${highlightValue}</mark>`);
  }

  public static highlightText(text: string, subString: string): string {
    const indexes: number[] = ClStringHelper.getIndicesOf(subString, text);

    const searchLength: number = subString.length;
    for (const i of indexes.reverse()) {
      text = CaHighlightTextHelper.highlightTextFromPosition(text, i, searchLength);
    }

    return text;
  }

  public static highlightTexts(text: string, subString: string[]): string {
    let highlightedText: string = text;
    for (const str of subString) {
      highlightedText = CaHighlightTextHelper.highlightText(highlightedText, str);
    }

    return highlightedText;
  }


}
