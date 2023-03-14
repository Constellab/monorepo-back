import {Component, Inject, OnInit} from '@angular/core';
import {LabResourceViewSpecWithConfig} from '../../../../../lab-core/model/entities/resource/lab-resource-view.entity';
import {labConvertTransformersWithConfigToParams} from '../../../../../lab-core/model/global/lab-transformer.class';
import {ClHelpService} from '@monorepo/core-lib';
import {TdTaskViewerConfig} from '@monorepo/technical-doc';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';


export type LabConfigureViewerDialogInput = TdTaskViewerConfig;

/**
 * Component used in the workflow to configure the ViewTask
 */
@Component({
  selector: 'lab-configure-viewer-dialog',
  templateUrl: './lab-configure-viewer-dialog.component.html',
  styleUrls: ['./lab-configure-viewer-dialog.component.scss']
})
export class LabConfigureViewerDialogComponent implements OnInit {

  taskConfig: TdTaskViewerConfig;

  constructor(@Inject(MAT_DIALOG_DATA) private input: LabConfigureViewerDialogInput,
              private dialogRef: MatDialogRef<LabConfigureViewerDialogComponent>) {
    this.taskConfig = ClHelpService.deepClone(input);
  }

  ngOnInit(): void {
  }

  onResourceTypingChange(): void {
    this.taskConfig.view_config = null;
  }

  onViewConfigured(configuration: LabResourceViewSpecWithConfig): void {
    this.taskConfig.view_config = {
      view_method_name: configuration.viewMethodName,
      config_values: configuration.viewConfigValues,
      transformers: labConvertTransformersWithConfigToParams(configuration.transformersWithConfig)
    };
  }

  save(): void {
    this.dialogRef.close(this.taskConfig);
  }

}
