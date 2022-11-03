import {FlTextEditorBlockAddButton, FlTextEditorConfig, FlTextEditorState} from '@monorepo/front-core-lib';

export class CaCommentTextEditorConfig extends FlTextEditorConfig{
  getAndSaveImage(imgBlob: Blob, state: FlTextEditorState): any {
  }

  getBlockAddButtons(state: FlTextEditorState): FlTextEditorBlockAddButton[] {
    return [];
  }

  getToolbarConfig(): any {
    return [
      ['bold', 'italic', 'strike'],
      ['link'],
      [{list: 'ordered'}, {list: 'bullet'}],
      ['blockquote'],
      ['code']
    ]
  }

}
