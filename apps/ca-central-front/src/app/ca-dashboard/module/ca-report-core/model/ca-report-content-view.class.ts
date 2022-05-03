import {CaReportContentViewComponent} from '../component/ca-report-content-view/ca-report-content-view.component';
import {RvConfigValues, RvResourceView, RvTransformerParams} from '@monorepo/resource-view';
import {FlQuillEmbed} from '@monorepo/front-core-lib';


export interface CaReportViewConfig {
  filename: string;
  id: string;
  resource_id: string;
  view_method_name: string;
  view_config: RvConfigValues;
  transformers: RvTransformerParams[];
  title: string;
  caption: string;
}

export class CaReportContentViewBlot extends FlQuillEmbed {

  static blotName: 'resource_view' = 'resource_view';
  static tagName = 'ca-report-content-view';

  private readonly storedValue: RvResourceView;

  static create(value: CaReportViewConfig): any {
    const node: HTMLElement = super.create(value) as any;

    // pass data to the component via the node
    const component: CaReportContentViewComponent = node as any;
    component.viewConfig = value;

    return node;
  }

  constructor(node: Node, value: any) {
    super(node);
    this.storedValue = value;
  }

  value(): { resource_view: RvResourceView } {

    return {[CaReportContentViewBlot.blotName]: this.storedValue};
  }
}
