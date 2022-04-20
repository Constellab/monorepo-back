import Quill from 'quill';
import {LabConfigValues} from '../../../lab-core/model/entities/lab-config.entity';
import {LabCallTransformerParams} from '../../../lab-core/model/global/lab-transformer.class';

const BlockEmbed = Quill.import('blots/block/embed');


export interface LabReportContentView {
  resource_id: string;
  view_method_name: string;
  view_config: LabConfigValues;
  transformers: LabCallTransformerParams[];
}

export class LabReportContentViewBlot extends BlockEmbed {

  static blotName: 'resource_view' = 'resource_view';
  static tagName = 'lab-report-content-view';

  private readonly storedValue: LabReportContentView;

  static create(value: LabReportContentView): any {
    const node: HTMLElement = super.create();


    node.setAttribute('resource-id', value.resource_id);
    node.setAttribute('view-method-name', value.view_method_name);
    node.setAttribute('view-config', JSON.stringify(value.view_config));
    node.setAttribute('transformers', JSON.stringify(value.transformers));
    // node.setAttribute('image-title', value.title ?? '');
    // node.setAttribute('caption', value.caption ?? '');

    return node;
  }

  constructor(node: Node, value: LabReportContentView) {
    super(node, value);
    this.storedValue = value;
  }

  value(): { resource_view: LabReportContentView } {
    return {[LabReportContentViewBlot.blotName]: this.storedValue};
  }
}

