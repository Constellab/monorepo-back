import { BlBlockType, BlNewRichText, BlRichTextBlock } from '@monorepo/back-core-lib';

export interface CnNoteViewBlockData {
  id: string;
  view_config_id?: string;
  resource_id?: string;
  scenario_id?: string;
  view_method_name: string;
  view_config: any;
  title: string;
  caption: string;
}

export interface CnNoteFileViewBlockData {
  id: string;
  title: string;
  caption: string;
}

export class CnNoteContent extends BlNewRichText {
  public getResourceViewsBlocks(): BlRichTextBlock<CnNoteViewBlockData>[] {
    return this.getBlocksByType(BlBlockType.RESOURCE_VIEW);
  }

  public getFileViewsBlocks(): BlRichTextBlock<CnNoteFileViewBlockData>[] {
    return this.getBlocksByType(BlBlockType.FILE_VIEW);
  }
}
