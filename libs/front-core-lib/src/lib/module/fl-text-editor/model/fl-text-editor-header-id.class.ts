import {ClStringHelper} from '@monorepo/core-lib';
import {FlQuillHeader} from './fl-quill-export.class';

export interface FlRichTextHeader {
  level: number;
  id: string;
}

export class FlTextEditorHeaderId extends FlQuillHeader {
  static create(value: number | string | FlRichTextHeader): any {
    if (typeof value === 'number' || typeof value === 'string') {
      return super.create(value);
    } else {
      const node: HTMLElement = super.create(value.level) as any;
      if (value.id) {
        node.setAttribute('id', value.id);
      }
      return node;
    }
  }

  static formats(domNode: HTMLElement): FlRichTextHeader {
    const result = super.formats(domNode);
    const id = ClStringHelper.toKebabCase(domNode.innerText);

    //Set idea before the first reload
    if (!domNode.id) {
      domNode.id = id;
    }

    return {
      level: result,
      id: id
    };
  }

  format(name: string, value: any): void {
    super.format(name, value);
  }
}
