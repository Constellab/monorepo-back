import {LabConfigValues} from '../../../lab-core/model/entities/lab-config.entity';
import {LabReportContentViewComponent} from './component/lab-report-content-view/lab-report-content-view.component';
import {ClHelpService} from '@monorepo/core-lib';
import {FlQuillEmbed} from '@monorepo/front-core-lib';
import {RvTransformerParams} from '@monorepo/resource-view';


export interface LabReportContentView {
  id: string;
  resource_id: string;
  view_method_name: string;
  view_config: LabConfigValues;
  transformers: RvTransformerParams[];
  title: string;
  caption: string;
}

export class LabReportContentViewBlot extends FlQuillEmbed {

  static blotName: 'resource_view' = 'resource_view';
  static tagName = 'lab-report-content-view';

  public domNode: HTMLElement;

  private readonly storedValue: LabReportContentView;

  static create(value: LabReportContentView): any {
    const node: HTMLElement = super.create(value) as any;

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
    super(node);
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

