import {Injectable} from '@angular/core';
import {
  FlDialogService,
  FlQuillConfig,
  FlTextEditorBlockAddButton,
  FlTextEditorConfig,
  FlTextEditorImageLoader,
  FlTextEditorSnowButton,
  FlTextEditorState
} from '@monorepo/front-core-lib';
import {HaStoryService} from '../../../ha-core/ha-service/ha-story.service';

/**
 * Config for the text editor in the report
 */
@Injectable({providedIn: 'root'})
export class HaStoryTextEditorConfig extends FlTextEditorConfig implements FlTextEditorImageLoader {

  private storyId: string;
  constructor(private storyService: HaStoryService,
              private dialogService: FlDialogService,
              storyId?: string) {
    super();
    if(storyId)
      this.storyId = storyId;
  }

  getToolbarConfig(): any {
    return FlQuillConfig.completeToolbarConfig;
  }

  getSnowButtons(): FlTextEditorSnowButton[] {
    return [];
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

  insertImageFromFile(file: File, textEditorState: FlTextEditorState): void {
    const index = textEditorState.getCurrentSelectionIndex();
    this.storyService.uploadImage(file, this.storyId).subscribe(
      fileUrl => {
        textEditorState.insertImageFromUrl(fileUrl, index)
      }
    );
  }

  public getImageUrl(filename: string): string {
    return this.storyService.getImageUrl(filename);
  }

  onPasteImage(file: File, state: FlTextEditorState): any {

    this.insertImageFromFile(file, state);
    return {ops: []} //Return the delta without modification with the image pasted
  }

}
