import Quill from 'quill';
import {flRootInjector} from '../../utils/fl-root-injector';
import {DomSanitizer} from '@angular/platform-browser';
import {SecurityContext} from '@angular/core';

const BlockEmbed = Quill.import('blots/block/embed');

export interface FlTextEditorImage {
  alt: string;
  url: string;
  naturalWidth?: number;
  naturalHeight?: number;
}

export class FlTextEditorImageBlot extends BlockEmbed {

  static blotName = 'image';
  static tagName = 'img';


  static create(value: FlTextEditorImage): any {
    const node: HTMLImageElement = super.create();

    const sanitizer: DomSanitizer = flRootInjector.get(DomSanitizer);

    node.setAttribute('alt', value.alt);
    node.setAttribute('src', sanitizer.sanitize(SecurityContext.URL, value.url));

    if (value.naturalWidth && value.naturalHeight) {
      node.width = value.naturalWidth;
      node.height = value.naturalHeight;
    }
    return node;
  }


  static value(node: HTMLImageElement): FlTextEditorImage {
    return {
      alt: node.getAttribute('alt'),
      url: node.getAttribute('src'),
      naturalWidth: node.naturalWidth,
      naturalHeight: node.naturalHeight
    };
  }

  remove(): void {
    super.remove();
    console.log('Remove');
  }
}

