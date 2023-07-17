import {BlRichText, BlRichTextOp} from '@monorepo/back-core-lib';

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

export interface CnReportViewOp extends BlRichTextOp {
  insert: {
    resource_view: CnReportViewConfig
  };
}


export class CnReportContent extends BlRichText {
  public static readonly viewOps = 'resource_view';

  public getViewsOps(): CnReportViewOp[] {
    return this.getSpecialOps(CnReportContent.viewOps);
  }

  public getViewsOp(filename: string): CnReportViewOp | undefined {
    return this.findSpecialOp(CnReportContent.viewOps, (viewOp: CnReportViewOp) => viewOp.insert.resource_view.filename === filename);
  }
}
