import {FlQuillLink} from './fl-quill-export.class';


export class FlTextEditorLinkWithoutTarget extends FlQuillLink {
  static create(value: string): any {
    const node: HTMLElement = super.create(value) as any;
    node.removeAttribute('target');
    return node;
  }
}
