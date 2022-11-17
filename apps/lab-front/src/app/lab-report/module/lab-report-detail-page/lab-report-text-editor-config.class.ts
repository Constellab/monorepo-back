import {
  FlDialogService,
  FlQuillConfig,
  FlTextEditorBlockAddButton,
  FlTextEditorConfig,
  FlTextEditorImageLoader,
  FlTextEditorSnowButton,
  FlTextEditorState
} from '@monorepo/front-core-lib';
import {LabReportService} from '../../../lab-core/entity-service/lab-report.service';
import {
  LabSelectViewConfigDialogComponent
} from '../../../lab-core/entity-module/lab-view-config-core/component/lab-select-view-config-dialog/lab-select-view-config-dialog.component';
import {LabViewConfig} from '../../../lab-core/model/entities/resource/lab-view-config.entity';
import {LabReportContentView, LabReportContentViewBlot} from './lab-report-content-view.class';

/**
 * Config for the text editor in the report
 */
export class LabReportTextEditorConfig extends FlTextEditorConfig implements FlTextEditorImageLoader {
  constructor(private reportId: string,
              private reportService: LabReportService,
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
        icon: 'add_chart', type: 'button', tooltip: 'biox.report_add_view',
        onAction: () => this.openSelectResourceView(state)
      },
      this.getCodeBlockAddButton(state),
      this.getHintBlockAddButton(state),
    ];
  }

  getSnowButtons(): FlTextEditorSnowButton[] {
    return [];
  }

  public getImageUrl(filename: string): string {
    return this.reportService.getImageUrl(filename);
  }

  onPasteImage(imgFile: File, state: FlTextEditorState): any {
    return this.insertImageFromFile(imgFile, state);
  }

  private insertImageFromFile(file: File, textEditorState: FlTextEditorState): void {
    const index = textEditorState.getCurrentSelectionIndex();
    this.reportService.uploadImage(file).subscribe(
      fileUrl => textEditorState.insertImageFromUrl(fileUrl, index)
    );
  }

  private openSelectResourceView(textEditorState: FlTextEditorState): void {
    this.dialogService.openBigDialog(LabSelectViewConfigDialogComponent, {data: this.reportId}).afterClosed()
      .subscribe(viewConfig => this.insertResourceView(textEditorState, viewConfig));
  }

  private insertResourceView(textEditorState: FlTextEditorState, viewConfig?: LabViewConfig): void {
    if (viewConfig == null) return;
    const index = textEditorState.getCurrentSelectionIndex();
    const contentView: LabReportContentView = {
      id: viewConfig.id + '_' + new Date().getTime(),
      resource_id: viewConfig.resource.id,
      experiment_id: viewConfig.experiment?.id,
      view_method_name: viewConfig.viewName,
      view_config: viewConfig.configValues,
      transformers: viewConfig.transformers,
      title: viewConfig.title,
      caption: null
    };

    textEditorState.insertEmbed(index, LabReportContentViewBlot.blotName, contentView);
  }
}
