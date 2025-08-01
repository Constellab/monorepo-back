import { JSDOM } from 'jsdom';

import { TeInlineToolType, TeRichText } from './lib';

export interface TeMentionUser {
  id: string;
  firstname: string;
  lastname: string;
}

export class TeRichTextMentionHelper {
  public static getMentions(richText: TeRichText): TeMentionUser[] {
    const mentions: TeMentionUser[] = [];
    for (const block of richText.getBlocks()) {
      const htmlData = JSON.stringify(block.data);

      // retrieve all the element te-mention-inline inside htmlData
      // then read the data-jsondata attribute as json
      // using jsdom
      const mentionElement = new JSDOM(`<!DOCTYPE html>${htmlData}`);
      const mentionElements = mentionElement.window.document.querySelectorAll(TeInlineToolType.MENTION);
      for (const element of mentionElements) {
        const attribute = element.getAttribute('data-jsondata');
        try {
          // replace all '"/' by '' to avoid parsing error
          const json = JSON.parse(attribute.replace(/\\"/g, ''));
          mentions.push(json);
        } catch (e) {
          throw Error(`Error parsing mention: ${attribute}. Error message: ${e}`);
        }
      }
    }

    return mentions;
  }
}
