import {Component, OnInit} from '@angular/core';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {LabWorkflowActionEvent} from '../../model/lab-workflow-drawer-event.class';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

/**
 * This component is the content of the drawer,
 * the content is adapted based on user action
 */
@Component({
  selector: 'lab-workflow-drawer-action',
  templateUrl: './lab-workflow-drawer-action.component.html',
  styleUrls: ['./lab-workflow-drawer-action.component.scss']
})
export class LabWorkflowDrawerActionComponent implements OnInit {

  action$: Observable<LabWorkflowActionEvent>;

  drawerWidth: string = '25em';

  constructor(private actionState: LabWorkflowActionState) {
  }

  ngOnInit(): void {
    this.action$ = this.actionState.getAction$().pipe(tap(action => this.getDrawerWidth(action)));
  }

  // set specific drawer width base on action
  private getDrawerWidth(action: LabWorkflowActionEvent): void {
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
