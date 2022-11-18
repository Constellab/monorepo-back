import {ClStringHelper} from '@monorepo/core-lib';
import {CaProjectService} from '../../service-api/ca-project.service';
import {
  FlTextEditorBlockAddButton,
  FlTextEditorConfig,
  FlTextEditorImageLoader,
  FlTextEditorSnowButton,
  FlTextEditorState
} from '@monorepo/front-core-lib';
import {EventEmitter} from '@angular/core';

export class CaCommentTextEditorConfig extends FlTextEditorConfig implements FlTextEditorImageLoader {

  sendButtonEvent$: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private projectService: CaProjectService) {
    super();
  }

  onPasteImage(imgFile: File, state: FlTextEditorState): any {
    return this.insertImageFromFile(imgFile, state);
  }

  public getImageUrl(filename: string): string {
    return this.projectService.getCommentImageUrl(filename);
  }

  getBlockAddButtons(state: FlTextEditorState): FlTextEditorBlockAddButton[] {
    return [];
  }

  getToolbarConfig(): any {
    return {
      container: [
        ['bold', 'italic'],
        ['link'],
        [{list: 'ordered'}, {list: 'bullet'}],
        ['blockquote'],
        ['code']
      ]
    }
  }

  getSnowButtons(): FlTextEditorSnowButton[] {
    return [
      {
        icon: 'image',
        type: 'fileExplorer',
        onAction: (imgBlob: Blob, state: FlTextEditorState) => this.insertImageFromFile(
          new File([imgBlob], ClStringHelper.generateUUID()),
          state
        )
      },
      {
        icon: 'sentiment_satisfied',
        type: 'button',
        disabled: true,
        onAction: (e, state: FlTextEditorState) => this.openEmojiPanel(e, state)
      },
      {
        icon: 'send',
        type: 'button',
        onAction: () => this.sendComment()
      }
    ];
  }

  private insertImageFromFile(file: File, state: FlTextEditorState): void {
    const index = state.getCurrentSelectionIndex();
    this.projectService.uploadCommentImage(file).subscribe(
      fileUrl => state.insertImageFromUrl(fileUrl, index)
    );
  }

  private openEmojiPanel(event: any, state: FlTextEditorState): void {

  }

  private sendComment(): void {
    this.sendButtonEvent$.emit(true);
  }

}
