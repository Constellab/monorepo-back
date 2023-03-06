import {ScrollDispatcher} from '@angular/cdk/overlay';
import {ElementRef} from '@angular/core';
import {FlFileHelper} from '../../../service/fl-file.helper';
import {FlTextEditorState} from '../state/fl-text-editor.state';
import {FlTextEditorConfig} from './fl-text-editor-config.class';
import {ClStringHelper} from '@monorepo/core-lib';

export type FlQuillScrollContainer = 'auto' | 'child' | 'body';

export class FlQuillSetup {

  // retrieve the first parent that is scrollable
  public static getScrollingContainer(scrollContainer: FlQuillScrollContainer, scrollDispatcher: ScrollDispatcher,
                                      documentElement: HTMLElement,
                                      elementRef: ElementRef): HTMLElement | string {
    if (scrollContainer === 'child') return '.ql-editor';
    if (scrollContainer === 'body') return documentElement;

    // retrieve scrollable parents
    const scrollableElements = scrollDispatcher.getAncestorScrollContainers(elementRef);

    // if there are some scrollable parent, use the first one
    if (scrollableElements.length > 0) {
      return scrollableElements[scrollableElements.length - 1].getElementRef().nativeElement;
    }

    // otherwise, use document as scrolling container
    return documentElement;
  }

  public static addMatcherLink(index: number, link: string, delta: any, state: FlTextEditorState): any {
    return state.insertLink(index, link, link);
  }

  public static addMatcher(node: any, delta: any, state: FlTextEditorState, config: FlTextEditorConfig): any {
    const insertImage: any = delta.ops[0].insert;
    const firstDelta: any = delta;
    const imageData: string = insertImage.image;
    if (imageData.startsWith('http')) {
      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        0;
        delta = state.insertImageFromUrl({
          filename: img.src,
          width: img.width,
          height: img.height
        }, state.getCurrentSelectionIndex());

        return delta;
      };
    } else if (imageData.startsWith('data')) {
      const blob: Blob = FlFileHelper.convertBase64ToBlob(insertImage.image.split(',')[1], 'image/png');
      delta = config.onPasteImage(new File([blob], ClStringHelper.generateUUID()), state);
      return delta;
    }

    return firstDelta == delta ? {ops: []} : delta;
  }

  public static addMatcherText(index: number, text: string, delta: any, state: FlTextEditorState): any{
    return state.insertText(index, text);
  }

}
