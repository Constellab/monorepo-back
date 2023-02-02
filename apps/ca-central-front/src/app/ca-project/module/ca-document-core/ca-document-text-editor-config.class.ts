import {
  FlDialogService,
  FlQuillConfig,
  FlTextEditorBlockAddButton,
  FlTextEditorConfig,
  FlTextEditorImageLoader,
  FlTextEditorSnowButton,
  FlTextEditorState
} from '@monorepo/front-core-lib';
import {CaProjectService} from '../../../ca-core/service-api/ca-project.service';


export class CaDocumentTextEditorConfig extends FlTextEditorConfig implements FlTextEditorImageLoader {

  constructor(private documentId: string,
              private projectService: CaProjectService,
              private dialogService: FlDialogService) {
    super();
  }


  getBlockAddButtons(state: FlTextEditorState): FlTextEditorBlockAddButton[] {
    return [
      {
        icon: 'image', type: 'fileExplorer',
        onAction: file => this.insertImageFromFile(file, state)
      },
      this.getCodeBlockAddButton(state),
      this.getHintBlockAddButton(state),
      this.getVideoAddButton(state, this.dialogService),
      this.getFormulaAddButton(state, this.dialogService)
    ];
  }

  getImageUrl(filename: string): string {
    return this.projectService.getConstellabDocumentImageUrl(this.documentId, filename);
  }

  getSnowButtons(): FlTextEditorSnowButton[] {
    return [];
  }

  getToolbarConfig(): any {
    return FlQuillConfig.completeToolbarConfig;
  }

  onPasteImage(imgFile: File, state: FlTextEditorState): any {
    this.insertImageFromFile(imgFile, state);
    return {ops: []} //Return the delta without modification with the image pasted
  }

  insertImageFromFile(file: File, textEditorState: FlTextEditorState): void {
    const index = textEditorState.getCurrentSelectionIndex();
    this.projectService.uploadConstellabDocumentImage(file, this.documentId).subscribe(
      fileUrl => textEditorState.insertImageFromUrl(fileUrl, index)
    );
  }


}
