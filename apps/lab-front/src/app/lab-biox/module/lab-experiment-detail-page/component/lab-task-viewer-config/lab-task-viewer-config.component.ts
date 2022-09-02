import {Component, OnInit} from '@angular/core';
import {LabWorkflowNodeIO} from '../../model/lab-workflow-node-io.class';
import {mergeMap, Observable, of} from 'rxjs';
import {LabWorkflowNodeDetailState} from '../../state/lab-workflow-node-detail.state';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {
  LabConfigureViewerDialogComponent,
  LabConfigureViewerDialogInput
} from '../lab-configure-viewer-dialog/lab-configure-viewer-dialog.component';
import {LabTaskViewerConfig} from '../../../../../lab-core/model/entities/lab-typing-name.class';
import {map} from 'rxjs/operators';

/**
 * Specific component to configure a task of type ViewTask
 *
 * This allows the user to configure the view
 */
@Component({
  selector: 'lab-task-viewer-config',
  templateUrl: './lab-task-viewer-config.component.html',
  styleUrls: ['./lab-task-viewer-config.component.scss']
})
export class LabTaskViewerConfigComponent implements OnInit {

  isEditable$: Observable<boolean>;

  node$: Observable<LabWorkflowNodeIO>;
  config$: Observable<LabTaskViewerConfig>;

  constructor(private nodeDetail: LabWorkflowNodeDetailState,
              private dialogService: FlDialogService,
              private experimentState: LabExperimentDetailPageState) {
  }

  ngOnInit(): void {
    this.node$ = this.nodeDetail.getNode$().pipe(
      map(node => {
        if (node instanceof LabWorkflowNodeIO) {
          return node;
        } else {
          return null;
        }
      })
    );

    this.config$ = this.node$.pipe(
      mergeMap(node => {
        if (node == null) return of(null);
        return node.getObject$()
          .pipe(map(process => process.getConfigValues() as LabTaskViewerConfig));
      })
    );

    this.isEditable$ = this.experimentState.isEditable$();
  }


  openViewerConfiguration(node: LabWorkflowNodeIO): void {
    const data: LabConfigureViewerDialogInput = node.currentObject.getConfigValues() as LabTaskViewerConfig;

    this.dialogService.openMediumDialog(LabConfigureViewerDialogComponent,
      {data: data, panelClass: 'g-dialog-main-background'}).afterClosed().subscribe(
      resource => this.onConfigurationClosed(resource)
    );
  }

  private onConfigurationClosed(config?: LabTaskViewerConfig): void {
    if (config) {
      this.nodeDetail.updateConfigValues(config);
    }
  }


}
