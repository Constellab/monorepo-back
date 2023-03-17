import {
  FlDialogService, FlQuillConfig, FlTextEditorBlockAddButton,
  FlTextEditorConfig,
  FlTextEditorImageLoader, FlTextEditorSnowButton,
  FlTextEditorState
} from '@monorepo/front-core-lib';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {Observable} from 'rxjs';

export class CaProjectDescriptionTextEditorConfig extends FlTextEditorConfig implements FlTextEditorImageLoader {

  private projectId: string;

  constructor(private projectId$: Observable<string>,
              private projectService: CaProjectService,
              private dialogService: FlDialogService) {
    super();
    this.projectId$.subscribe(projectId => this.projectId = projectId);
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
    return this.projectService.getDescriptionImageUrl(this.projectId, filename);
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
    this.projectService.uploadDescriptionImage(this.projectId, file).subscribe(
      fileUrl => textEditorState.insertImageFromUrl(fileUrl, index)
    );
  }


}
