import {CmRichText, CmRichTextOp} from '@monorepo/common-model';

export interface CnReportViewConfig {
  id: string;
  filename?: string; // provided if the view file was uploaded to the object storage
  resource_id: string;
  view_method_name: string;
  view_config: any;
  transformers: any[];
  title: string;
  caption: string;
}

export interface CnReportViewOp extends CmRichTextOp{
  insert: {
    resource_view: CnReportViewConfig
  };
}


export class CnReportContent extends CmRichText {
  public static readonly viewOps = 'resource_view';

  public getViewsOps(): CnReportViewOp[] {
    return this.getSpecialOps(CnReportContent.viewOps);
  }

}
