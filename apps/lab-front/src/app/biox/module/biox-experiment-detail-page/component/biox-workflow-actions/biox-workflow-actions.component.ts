import {Component, OnInit} from '@angular/core';
import {WorkflowManagerState} from '../../state/workflow-manager-state';

/**
 * Actions button for the workflow
 */
@Component({
  selector: 'gen-biox-workflow-actions',
  templateUrl: './biox-workflow-actions.component.html',
  styleUrls: ['./biox-workflow-actions.component.scss']
})
export class BioxWorkflowActionsComponent implements OnInit {

  constructor(private workflowManager: WorkflowManagerState) {
  }

  ngOnInit(): void {
  }

  addInterface(): void {
    this.workflowManager.addInterface();
  }

  addOuterface(): void {
    this.workflowManager.addOuterface();
  }

  save(): void{
    console.log(this.workflowManager.workflow);
  }
}
