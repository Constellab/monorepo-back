import {BlBlockType, BlNewRichText, BlOutputBlockData} from '@monorepo/back-core-lib';

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


export class CnReportContent extends BlNewRichText {
  public static readonly viewOps = 'resource_view';


  public getViewsBlocks(): BlOutputBlockData<CnReportViewConfig>[] {
    return this.getBlocksByType(BlBlockType.RESOURCE_VIEW);
  }

  public getViewsBlock(filename: string): CnReportViewConfig | undefined {
    return this.getViewsBlocks().find(op => op.data.filename === filename)?.data ?? null;
  }
}
