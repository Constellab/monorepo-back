import {Component, Input, OnInit} from '@angular/core';
import {WorkflowNode} from '../../model/workflow-node.class';
import {BioxProcessableBase} from '../../../../../core/model/entities/biox-processable.entity';
import {BioxConfig} from '../../../../../core/model/entities/biox-config.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {BioxConfigureSpecsDialogComponent} from '../../../../../core/entity-module/biox-config-core/component/biox-configure-specs-dialog/biox-configure-specs-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {BioxExperimentDetailPageState} from '../../state/biox-experiment-detail-page.state';

@Component({
  selector: 'gen-biox-workflow-node-detail',
  templateUrl: './biox-workflow-node-detail.component.html',
  styleUrls: ['./biox-workflow-node-detail.component.scss']
})
export class BioxWorkflowNodeDetailComponent implements OnInit {

  @Input() node: WorkflowNode<any>;

  constructor(private dialogService: FlDialogService,
              private experimentState: BioxExperimentDetailPageState) {
  }

  ngOnInit(): void {
  }

  get config(): BioxConfig | null {
    const object: any = this.node.object;

    // the config is only for processable node
    return object instanceof BioxProcessableBase && object.hasConfig() ?
      object.config : null;
  }

  get isEditable(): boolean {
    return this.experimentState.isEditable();
  }

  openConfig(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);

    console.log(this.config.data.getDynamicFormFieldsConfig());

    this.dialogService.openMediumDialog(BioxConfigureSpecsDialogComponent,
      {data: this.config.data}).afterClosed().subscribe(
      config => this.onConfigDialogClosed(config)
    );
  }

  private onConfigDialogClosed(config?: any): void {
    if (config != null) {
      // save the config into the value
      this.config.data.params = config;
    }
  }
}
