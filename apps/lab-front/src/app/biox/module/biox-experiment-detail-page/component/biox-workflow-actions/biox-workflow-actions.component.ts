import {Component, OnInit} from '@angular/core';
import {WorkflowManagerService} from '../../service/workflow-manager.service';

/**
 * Actions button for the workflow
 */
@Component({
  selector: 'gen-biox-workflow-actions',
  templateUrl: './biox-workflow-actions.component.html',
  styleUrls: ['./biox-workflow-actions.component.scss']
})
export class BioxWorkflowActionsComponent implements OnInit {

  constructor(private workflowManager: WorkflowManagerService) {
  }

  ngOnInit(): void {
  }

  addInterface(): void {
    this.workflowManager.addInterface();
  }

  addOuterface(): void {
    this.workflowManager.addOuterface();
  }

}
