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
import {Observable} from 'rxjs';

export class CaCommentTextEditorConfig extends FlTextEditorConfig implements FlTextEditorImageLoader {

  sendButtonEvent$: EventEmitter<boolean> = new EventEmitter<boolean>();
  sendEmojiButtonEvent$: EventEmitter<HTMLElement> = new EventEmitter<HTMLElement>();

  private projectId: string;

  constructor(private projectService: CaProjectService, private projectId$: Observable<string>) {
    super();
    this.projectId$.subscribe(projectId => this.projectId = projectId);
  }


  onPasteImage(imgFile: File, state: FlTextEditorState): any {
    return this.insertImageFromFile(imgFile, state);
  }

  public getImageUrl(filename: string): string {
    return this.projectService.getCommentImageUrl(filename, this.projectId);
  }

  getBlockAddButtons(): FlTextEditorBlockAddButton[] {
    return [];
  }


  getToolbarConfig(): any {
    return {
      container: [
        ['bold', 'italic'],
        // ['link'],
        [{list: 'ordered'}, {list: 'bullet'}],
        ['blockquote'],
        ['code']
      ]
    };
  }

  getSnowButtons(): FlTextEditorSnowButton[] {
    return [
      {
        icon: 'image',
        type: 'fileExplorer',
        onAction: (imgFile: File, state: FlTextEditorState) =>
          this.insertImageFromFile(
            new File([imgFile], ClStringHelper.generateUUID() + '.' + imgFile.name.split('.').pop(),
              {type: imgFile.type}),
            state
          )
      },
      {
        icon: 'sentiment_satisfied',
        type: 'button',
        onAction: (e) => this.openEmojiPanel(e)
      },
      {
        icon: 'send',
        type: 'button',
        tooltip: 'ctrl + return',
        onAction: () => this.sendComment()
      }
    ];
  }

  insertImageFromFile(file: File, state: FlTextEditorState): void {
    const index = state.getCurrentSelectionIndex();
    this.projectService.uploadCommentImage(file, this.projectId).subscribe(
      fileUrl => state.insertImageFromUrl(fileUrl, index)
    );
  }

  openEmojiPanel(event: Event): void {
    this.sendEmojiButtonEvent$.emit(event.target as HTMLElement);
  }

  private sendComment(): void {
    this.sendButtonEvent$.emit(true);
  }

}


export class CaEditCommentTextEditorConfig extends CaCommentTextEditorConfig {

  getSnowButtons(): FlTextEditorSnowButton[] {
    return [
      {
        icon: 'image',
        type: 'fileExplorer',
        onAction: (imgBlob: Blob, state: FlTextEditorState) => this.insertImageFromFile(
          new File([imgBlob], ClStringHelper.generateUUID(), {type: imgBlob.type}),
          state
        )
      },
      {
        icon: 'sentiment_satisfied',
        type: 'button',
        onAction: (e) => this.openEmojiPanel(e)
      },
      {
        icon: 'cancel',
        type: 'button',
        onAction: () => this.sendCancelEditEvent()
      },
      {
        icon: 'save',
        type: 'button',
        onAction: () => this.sendEditEvent()
      }
    ];
  }

  private sendCancelEditEvent(): void {
    this.sendButtonEvent$.emit(false);
  }

  private sendEditEvent(): void {
    this.sendButtonEvent$.emit(true);
  }
}
