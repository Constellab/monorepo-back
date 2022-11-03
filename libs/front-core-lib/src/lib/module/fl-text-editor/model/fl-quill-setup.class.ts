import {ScrollDispatcher} from '@angular/cdk/overlay';
import {ElementRef} from '@angular/core';
import {FlFileHelper} from '../../../service/fl-file.helper';
import {FlTextEditorState} from '../state/fl-text-editor.state';
import {FlTextEditorConfig} from './fl-text-editor-config.class';

export class FlQuillSetup {

  // retrieve the first parent that is scrollable
  public static getScrollingContainer(scrollContainer: 'auto' | 'child', scrollDispatcher: ScrollDispatcher, documentElement: HTMLElement,
                                      elementRef: ElementRef): HTMLElement | string {
    if (scrollContainer === 'child') {
      return '.ql-editor';
    }

    // retrieve scrollable parents
    const scrollableElements = scrollDispatcher.getAncestorScrollContainers(elementRef);
    // if there are some scrollable parent, use the first one
    if (scrollableElements.length > 0) {
      return scrollableElements[scrollableElements.length - 1].getElementRef().nativeElement;
    }

    // otherwise, use document as scrolling container
    return documentElement;
  }

  public static addMatcher(node: any, delta: any, state: FlTextEditorState, config: FlTextEditorConfig): any{
    const insertImage: any = delta.ops[0].insert;
    const imageData: string = insertImage.image;
    if (imageData.startsWith('http')) {
      delta.ops[0] = {
        insert: {
          figure: {
            filename: imageData,
            width: null,
            height: null,
            naturalWidth: null,
            naturalHeight: null,
            title: '',
            caption: ''
          }
        }
      };
    } else if (imageData.startsWith('data')) {
      const blob: Blob = FlFileHelper.convertBase64ToBlob(insertImage.image.split(',')[1], 'image/png');
      config.getAndSaveImage(blob, state);
      delta.ops = [];
    }
    return delta;
  }
}
