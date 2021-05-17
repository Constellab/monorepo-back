import {Component, OnInit} from '@angular/core';
import {WorkflowActionState} from '../../state/workflow-action-state.service';
import {WorkflowActionEvent} from '../../model/workflow-drawer-event.class';
import {Observable} from 'rxjs';
import {clRxjsDebug} from '@monorepo/core-lib';

/**
 * This component is the content of the drawer,
 * the content is adapted based on user action
 */
@Component({
  selector: 'gen-biox-workflow-drawer-action',
  templateUrl: './biox-workflow-drawer-action.component.html',
  styleUrls: ['./biox-workflow-drawer-action.component.scss']
})
export class BioxWorkflowDrawerActionComponent implements OnInit {

  action$: Observable<WorkflowActionEvent>;

  constructor(private actionState: WorkflowActionState) {
  }

  ngOnInit(): void {
    this.action$ = this.actionState.getAction$().pipe(clRxjsDebug());
  }
}
