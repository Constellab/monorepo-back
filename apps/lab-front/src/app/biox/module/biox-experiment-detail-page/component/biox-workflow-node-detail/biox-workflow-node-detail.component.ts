import {Component, OnInit} from '@angular/core';
import {WorkflowNode} from '../../model/workflow-node.class';
import {BioxProcess} from '../../../../../core/model/entities/process/biox-process.entity';
import {BioxConfig} from '../../../../../core/model/entities/biox-config.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {BioxConfigureSpecsFormDialogComponent} from '../../../../../core/entity-module/biox-config-core/component/biox-configure-specs-form-dialog/biox-configure-specs-form-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {BioxExperimentDetailPageState} from '../../state/biox-experiment-detail-page.state';
import {MatExpansionPanel} from '@angular/material/expansion';
import {BioxWorkflowNodeDetailState} from '../../state/biox-workflow-node-detail.state';

@Component({
  selector: 'gen-biox-workflow-node-detail',
  templateUrl: './biox-workflow-node-detail.component.html',
  styleUrls: ['./biox-workflow-node-detail.component.scss']
})
export class BioxWorkflowNodeDetailComponent implements OnInit {

  node: WorkflowNode<BioxProcess>;

  constructor(private dialogService: FlDialogService,
              private experimentState: BioxExperimentDetailPageState,
              private nodeDetailState: BioxWorkflowNodeDetailState) {
  }

  ngOnInit(): void {
    this.nodeDetailState.getNode$().subscribe(
      node => this.node = node
    );
  }

  get config(): BioxConfig | null {
    const object: BioxProcess = this.node.object;

    // don't show config for source
    if (object.isPlugSource()) {
      return null;
    }
    // the config is only for process node
    return object instanceof BioxProcess && object.hasConfig() ?
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

    console.log(this.config.data.getDynamicFormFieldsConfig());

    this.dialogService.openMediumDialog(BioxConfigureSpecsFormDialogComponent,
      {data: this.config.data}).afterClosed().subscribe(
      config => this.onConfigDialogClosed(config)
    );

    panel.open();
  }

  get isSource(): boolean {
    return this.node.object.isPlugSource();
  }

  private onConfigDialogClosed(config?: any): void {
    if (config != null) {
      // save the config into the value
      this.nodeDetailState.updateConfig(config);
    }
  }
}
