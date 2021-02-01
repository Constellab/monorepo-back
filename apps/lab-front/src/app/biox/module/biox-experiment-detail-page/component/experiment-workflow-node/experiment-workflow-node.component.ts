import {Component, Input, OnInit} from '@angular/core';
import {WorkflowManagerService} from '../../service/workflow-manager.service';
import {WorkflowNode} from '../../model/workflow-node.class';
import {BioxJob} from '../../../../../core/model/entities/biox-job.entity';
import {FlDialogService} from '@monorepo/front-core-lib';
import {BioxConfigureSpecsDialogComponent} from '../../../../../core/entity-module/biox-config-core/component/biox-configure-specs-dialog/biox-configure-specs-dialog.component';

/**
 * Node of an experiment in the workflow
 *
 * This component is converted to an angular element to be injectable in css
 */
@Component({
  selector: 'gen-experiment-workflow-node',
  templateUrl: './experiment-workflow-node.component.html',
  styleUrls: ['./experiment-workflow-node.component.scss']
})
export class ExperimentWorkflowNodeComponent implements OnInit {

  // Name of the node
  @Input() name: string;

  node: WorkflowNode<BioxJob>;

  constructor(private workflowManager: WorkflowManagerService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithName(this.name);
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }
  }

  nodeIsProtocol(): boolean {
    return this.node.object.process.isProtocol();
  }

  zoomInProtocol(): void {
    return this.workflowManager.selectLayer(this.node.nodeId);
  }

  get showConfigButton(): boolean {
    return this.node.object.process.hasConfigSpecs();
  }

  openConfig(): void {
    this.dialogService.openSmallDialog(BioxConfigureSpecsDialogComponent,
      {data: this.node.object.process.configSpecs}).afterClosed().subscribe(
      config => this.onConfigDialogClosed(config)
    );
  }

  private onConfigDialogClosed(config?: any): void{
    if(config != null){
      this.node.object.config.params = config;
    }
  }

}
