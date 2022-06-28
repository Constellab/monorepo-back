import {Injectable} from '@angular/core';
import {
  FlDialogService,
  FlQuillConfig,
  FlTextEditorBlockAddButton,
  FlTextEditorConfig,
  FlTextEditorImageLoader,
  FlTextEditorState
} from '@monorepo/front-core-lib';
import {HaDocumentationService} from '../../../ha-core/ha-service/ha-documentation.service';

/**
 * Config for the text editor in the report
 */
@Injectable({providedIn: 'root'})
export class HaDocTextEditorConfig extends FlTextEditorConfig implements FlTextEditorImageLoader {

  constructor(private docService: HaDocumentationService,
              private dialogService: FlDialogService) {
    super();
  }

  getToolbarConfig(): any {
    return FlQuillConfig.completeToolbarConfig;
  }

  getBlockAddButtons(state: FlTextEditorState): FlTextEditorBlockAddButton[] {
    return [
      {
        icon: 'image', type: 'fileExplorer',
        onAction: file => this.insertImageFromFile(file, state)
      },
      {
        icon: 'add_link', type: 'button',
        onAction: () => this.openSelectDocView(state)
      },
      this.getCodeBlockAddButton(state),
      this.getHintBlockAddButton(state),
      this.getVideoAddButton(state, this.dialogService),
    ];
  }

  public insertImageFromFile(file: File, textEditorState: FlTextEditorState): void {
    const index = textEditorState.getCurrentSelectionIndex();
    this.docService.uploadImage(file).subscribe(
      fileUrl => textEditorState.insertImageFromUrl(fileUrl, index)
    );
  }

  private openSelectDocView(textEditorState: FlTextEditorState): void {
  //   this.dialogService.openBigDialog().afterClosed()
  //     .subscribe(link => this.insertLink(textEditorState, link));
  }
  //
  // private insertLink(textEditorState: FlTextEditorState, link)

  public getImageUrl(filename: string): string {
    return this.docService.getImageUrl(filename);
  }
}
