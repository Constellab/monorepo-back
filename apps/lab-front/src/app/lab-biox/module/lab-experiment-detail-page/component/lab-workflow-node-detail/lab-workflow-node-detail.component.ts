import {Component, OnInit} from '@angular/core';
import {LabWorkflowNode} from '../../model/lab-workflow-node.class';
import {LabProcess} from '../../../../../lab-core/model/entities/process/lab-process.entity';
import {LabConfig} from '../../../../../lab-core/model/entities/lab-config.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {
  LabConfigureSpecsFormDialogComponent
} from '../../../../../lab-core/entity-module/lab-config-core/component/lab-configure-specs-form-dialog/lab-configure-specs-form-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {MatExpansionPanel} from '@angular/material/expansion';
import {LabWorkflowNodeDetailState} from '../../state/lab-workflow-node-detail.state';

@Component({
  selector: 'lab-workflow-node-detail',
  templateUrl: './lab-workflow-node-detail.component.html',
  styleUrls: ['./lab-workflow-node-detail.component.scss']
})
export class LabWorkflowNodeDetailComponent implements OnInit {

  node: LabWorkflowNode<LabProcess>;

  constructor(private dialogService: FlDialogService,
              private experimentState: LabExperimentDetailPageState,
              private nodeDetailState: LabWorkflowNodeDetailState) {
  }

  ngOnInit(): void {
    this.nodeDetailState.getNode$().subscribe(
      node => this.node = node
    );
  }

  get config(): LabConfig | null {
    const object: LabProcess = this.node.object;

    // don't show config for source
    if (object.isSource()) {
      return null;
    }
    // the config is only for process node
    return object instanceof LabProcess && object.hasConfig() ?
      object.config : null;
  }

  get isEditable(): boolean {
    return this.experimentState.isEditable();
  }

  // show the progress section if the progress bar has started
  get showProgress(): boolean {
    return this.node.object.progressBar != null && this.node.object.progressBar.wasStarted();
  }

  openConfig(event: MouseEvent, panel: MatExpansionPanel): void {
    ClHelpService.stopEventPropagation(event);

    this.dialogService.openMediumDialog(LabConfigureSpecsFormDialogComponent,
      {data: this.config.data}).afterClosed().subscribe(
      config => this.onConfigDialogClosed(config)
    );

    panel.open();
  }

  get isSource(): boolean {
    return this.node.object.isSource();
  }

  private onConfigDialogClosed(config?: any): void {
    if (config != null) {
      // save the config into the value
      this.nodeDetailState.updateConfigValues(config);
    }
  }
}
