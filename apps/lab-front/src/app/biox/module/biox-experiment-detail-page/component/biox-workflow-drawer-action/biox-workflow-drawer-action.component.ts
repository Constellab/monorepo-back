import {Component, OnInit} from '@angular/core';
import {WorkflowActionState} from '../../state/workflow-action-state';
import {WorkflowActionEvent} from '../../model/workflow-drawer-event.class';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

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

  drawerWidth: string = '25em';

  constructor(private actionState: WorkflowActionState) {
  }

  ngOnInit(): void {
    this.action$ = this.actionState.getAction$().pipe(tap(action => this.getDrawerWidth(action)));
  }

  // set specific drawer width base on action
  private getDrawerWidth(action: WorkflowActionEvent): void {
    switch (action?.action ?? null) {
      case 'processSelection':
        this.drawerWidth = '40em';
        return;
      default:
        this.drawerWidth = '25em';
        return;
    }
  }

}
