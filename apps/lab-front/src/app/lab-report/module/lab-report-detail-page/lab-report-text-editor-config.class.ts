import {Injectable} from '@angular/core';
import {
  FlQuillConfig,
  FlTextEditorBlockAddButton,
  FlTextEditorConfig,
  FlTextEditorImageLoader,
  FlTextEditorState
} from '@monorepo/front-core-lib';
import {LabReportService} from '../../../lab-core/entity-service/lab-report.service';

/**
 * Config for the text editor in the report
 */
@Injectable({providedIn: 'root'})
export class LabReportTextEditorConfig extends FlTextEditorConfig implements FlTextEditorImageLoader {

  constructor(private reportService: LabReportService) {
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
      this.getCodeBlockAddButton(state)
    ];
  }

  public insertImageFromFile(file: File, textEditorState: FlTextEditorState): void {
    const index = textEditorState.getCurrentSelectionIndex();
    this.reportService.uploadImage(file).subscribe(
      fileUrl => textEditorState.insertImageFromUrl(fileUrl, index)
    );
  }

  public getImageUrl(filename: string): string {
    return this.reportService.getImageUrl(filename);
  }
}
