import { BlBlockType, BlNewRichText, BlRichTextBlock } from '@monorepo/back-core-lib';

export interface CnReportViewBlockData {
  id: string;
  view_config_id?: string;
  resource_id?: string;
  experiment_id?: string;
  view_method_name: string;
  view_config: any;
  title: string;
  caption: string;
}

export interface CnReportFileViewBlockData {
  id: string;
  title: string;
  caption: string;
}


export class CnReportContent extends BlNewRichText {

  public getResourceViewsBlocks(): BlRichTextBlock<CnReportViewBlockData>[] {
    return this.getBlocksByType(BlBlockType.RESOURCE_VIEW);
  }

  public getFileViewsBlocks(): BlRichTextBlock<CnReportFileViewBlockData>[] {
    return this.getBlocksByType(BlBlockType.FILE_VIEW);
  }
}
