import {CmRichTextFigure} from '@monorepo/common-model';
import Quill from 'quill';
import Parchment from 'parchment';

const Embed = Quill.import('blots/block/embed') as typeof Parchment.Embed;

export class FlTextEditorFigureBlot extends Embed {

  static blotName = 'figure';
  static tagName = 'fl-text-editor-figure';
  static className = 'g-quill-block';

  public domNode: HTMLElement;

  private readonly storedValue: CmRichTextFigure;

  static create(value: CmRichTextFigure): any {
    const node: HTMLElement = super.create(value) as any;

    if (!value.naturalWidth) {
      value.naturalWidth = 100;
    }
    if (!value.naturalHeight) {
      value.naturalHeight = 100;
    }
    node.setAttribute('filename', value.filename);
    node.setAttribute('natural-width', value.naturalWidth.toString());
    node.setAttribute('natural-height', value.naturalHeight.toString());
    node.setAttribute('width', value.width?.toString() ?? value.naturalWidth.toString());
    node.setAttribute('height', value.height?.toString() ?? value.naturalHeight.toString());
    node.setAttribute('image-title', value.title ?? '');
    node.setAttribute('caption', value.caption ?? '');

    return node;
  }

  constructor(node: Node, value: CmRichTextFigure) {
    super(node);
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

