import Quill from 'quill';
import {CmRichTextFigure} from '@monorepo/common-model';

const BlockEmbed = Quill.import('blots/block/embed');



export class FlTextEditorFigureBlot extends BlockEmbed {

  static blotName = 'figure';
  static tagName = 'fl-text-editor-figure';

  private domNode: HTMLElement;

  private readonly storedValue: CmRichTextFigure;

  static create(value: CmRichTextFigure): any {
    const node: HTMLElement = super.create();
    node.setAttribute('filename', value.filename);
    node.setAttribute('width', value.width?.toString() ?? '100');
    node.setAttribute('height', value.height?.toString() ?? '100');
    node.setAttribute('image-title', value.title ?? '');
    node.setAttribute('caption', value.caption ?? '');

    return node;
  }

  constructor(node: Node, value: CmRichTextFigure) {
    super(node, value);
    this.storedValue = value;
  }

  value(): { figure: CmRichTextFigure } {
    const value: CmRichTextFigure = Object.assign(this.storedValue, {
      width: parseInt(this.domNode.getAttribute('width')),
      height: parseInt(this.domNode.getAttribute('height')),
      title: this.domNode.getAttribute('image-title'),
      caption: this.domNode.getAttribute('caption'),
    });
    return {
      figure: value
    };
  }
}

