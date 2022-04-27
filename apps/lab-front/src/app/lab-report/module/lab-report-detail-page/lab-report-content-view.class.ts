import Quill from 'quill';
import {LabConfigValues} from '../../../lab-core/model/entities/lab-config.entity';
import {LabCallTransformerParams} from '../../../lab-core/model/global/lab-transformer.class';
import {LabReportContentViewComponent} from './component/lab-report-content-view/lab-report-content-view.component';
import {ClHelpService} from '@monorepo/core-lib';

const BlockEmbed = Quill.import('blots/block/embed');


export interface LabReportContentView {
  resource_id: string;
  view_method_name: string;
  view_config: LabConfigValues;
  transformers: LabCallTransformerParams[];
  title: string;
  caption: string;
}

export class LabReportContentViewBlot extends BlockEmbed {

  static blotName: 'resource_view' = 'resource_view';
  static tagName = 'lab-report-content-view';

  private domNode: HTMLElement;

  private readonly storedValue: LabReportContentView;

  static create(value: LabReportContentView): any {
    const node: HTMLElement = super.create();

    // pass data to the component via the node
    const component: LabReportContentViewComponent = node as any;
    component.resourceId = value.resource_id;
    component.viewTitle = value.title;
    component.caption = value.caption;
    component.viewConfig = {
      methodName: value.view_method_name,
      configValues: ClHelpService.deepClone(value.view_config),
      transformers: ClHelpService.deepClone(value.transformers)
    };

    return node;
  }

  constructor(node: Node, value: LabReportContentView) {
    super(node, value);
    this.storedValue = value;
  }

  value(): { resource_view: LabReportContentView } {
    const value: LabReportContentView = Object.assign(this.storedValue, {
      title: this.domNode.getAttribute('view-title'),
      caption: this.domNode.getAttribute('caption'),
    });

    return {[LabReportContentViewBlot.blotName]: value};
  }
}

