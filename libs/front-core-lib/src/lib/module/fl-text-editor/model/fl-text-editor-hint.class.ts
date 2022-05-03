import {FlQuillBLock} from './fl-quill-export.class';

export type FlTextEditorHintType = 'info' | 'warning' | 'science';


export class FlTextEditorHint extends FlQuillBLock {

  static blotName = 'hint';
  static tagName = 'DIV';
  static className = 'g-text-editor-hint';

  static create(value: FlTextEditorHintType): any {
    const node: HTMLElement = super.create(value) as any;
    node.classList.add(`g-text-editor-hint-${value}`);
    return node;
  }

  static formats(domNode: HTMLElement): FlTextEditorHintType {
    return domNode.classList.contains('g-text-editor-hint-warning') ? 'warning' :
      domNode.classList.contains('g-text-editor-hint-science') ? 'science' :
        'info';
  }

}
