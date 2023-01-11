import {FlQuillEmbed} from './fl-quill-export.class';
import {CmRichTextFormula} from '@monorepo/common-model';


export class FlTextEditorFormulaBlot extends FlQuillEmbed {

  static blotName = 'customFormula';
  static tagName = 'fl-text-editor-formula';

  public domNode: HTMLElement;

  static create(value: CmRichTextFormula): any {
    const node: HTMLElement = super.create(value) as any;
    if (value == null) value = {formula: ''};
    node.setAttribute('formula', value.formula);
    node.setAttribute('formula-title', value.title ?? '');
    node.setAttribute('caption', value.caption ?? '');
    return node;
  }

  value(): { customFormula: CmRichTextFormula } {
    return {
      customFormula: {
        formula: this.domNode.getAttribute('formula'),
        title: this.domNode.getAttribute('formula-title'),
        caption: this.domNode.getAttribute('caption'),
      }
    };

  }

}
