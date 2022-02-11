import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

/**
 * Object representing the value stored to create a figur
 */
export interface FlTextEditorFigure {
  url: string;
  title?: string;
  caption?: string;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

export class FlTextEditorFigureBlot extends BlockEmbed {

  static blotName = 'figure';
  static tagName = 'fl-text-editor-figure';

  private domNode: HTMLElement;

  private readonly naturalImageWidth: number;
  private readonly naturalImageHeight: number;

  static create(value: FlTextEditorFigure): any {
    const node: HTMLElement = super.create();
    node.setAttribute('src', value.url);
    node.setAttribute('width', value.width?.toString() ?? '100');
    node.setAttribute('height', value.height?.toString() ?? '100');
    node.setAttribute('image-title', value.title ?? '');
    node.setAttribute('caption', value.caption ?? '');

    return node;
  }

  constructor(node: Node, value: FlTextEditorFigure) {
    super(node, value);
    this.naturalImageWidth = value.naturalWidth;
    this.naturalImageHeight = value.naturalHeight;
  }

  value(): { figure: FlTextEditorFigure } {
    return {
      figure: {
        url: this.domNode.getAttribute('src'),
        width: parseInt(this.domNode.getAttribute('width')),
        height: parseInt(this.domNode.getAttribute('height')),
        title: this.domNode.getAttribute('image-title'),
        caption: this.domNode.getAttribute('caption'),
        naturalWidth: this.naturalImageWidth,
        naturalHeight: this.naturalImageHeight
      }
    };
  }
}

