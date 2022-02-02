import {Component, OnInit} from '@angular/core';
import {ClHelpService} from '@monorepo/core-lib';
import {
  LabConfigureSpecsFormDialogComponent,
  LabConfigureSpecsFormDialogInput
} from '../../../../../lab-core/entity-module/lab-config-core/component/lab-configure-specs-form-dialog/lab-configure-specs-form-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {MatExpansionPanel} from '@angular/material/expansion';
import {LabWorkflowNodeDetailState} from '../../state/lab-workflow-node-detail.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LabWorkflowNodeProcess} from '../../model/lab-workflow-node-process.class';
import {LabProcess} from '../../../../../lab-core/model/entities/process/lab-process.entity';

@Component({
  selector: 'lab-workflow-node-detail',
  templateUrl: './lab-workflow-node-detail.component.html',
  styleUrls: ['./lab-workflow-node-detail.component.scss']
})
export class LabWorkflowNodeDetailComponent implements OnInit {

  labProcess$: Observable<LabProcess>;
  node$: Observable<LabWorkflowNodeProcess>;

  configMode$: Observable<'config' | 'source' | null>;
  showProgress$: Observable<boolean>;

  isEditable$: Observable<boolean>;

  constructor(private dialogService: FlDialogService,
              private experimentState: LabExperimentDetailPageState,
              private nodeDetailState: LabWorkflowNodeDetailState) {
  }

  ngOnInit(): void {
    this.labProcess$ = this.nodeDetailState.getProcess$();
    this.node$ = this.nodeDetailState.getNode$();

    this.configMode$ = this.nodeDetailState.getProcess$().pipe(map(
      process => this.getConfigMode(process)
    ));
    this.showProgress$ = this.nodeDetailState.getProcess$().pipe(
      map(process => process.progressBar != null && process.progressBar.wasStarted())
    );
    this.isEditable$ = this.experimentState.isEditable$();
  }

  private getConfigMode(process: LabProcess): 'config' | 'source' | null {
    if (process.isSource()) {
      return 'source';
    }

    return process.hasConfig() ? 'config' : null;
  }

  openConfig(event: MouseEvent, panel: MatExpansionPanel,
             node: LabWorkflowNodeProcess): void {
    ClHelpService.stopEventPropagation(event);

    const input: LabConfigureSpecsFormDialogInput = {
      configData: node.currentObject.config.data,
      title: 'biox.configuration',
      submitButtonText: 'save'
    };

    this.dialogService.openMediumDialog(LabConfigureSpecsFormDialogComponent,
      {data: input}).afterClosed().subscribe(
      config => this.onConfigDialogClosed(config)
    );

    panel.open();
  }

  private onConfigDialogClosed(config?: any): void {
    if (config != null) {
      // save the config into the value
      this.nodeDetailState.updateConfigValues(config);
    }
  }
}
