import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {WorkflowActionState} from '../../state/workflow-action-state.service';
import {MatDrawer} from '@angular/material/sidenav';

/**
 * Component around that wrap the workflow with a drawer to show information on drawer
 */
@Component({
  selector: 'gen-biox-workflow-drawer',
  templateUrl: './biox-workflow-drawer.component.html',
  styleUrls: ['./biox-workflow-drawer.component.scss']
})
export class BioxWorkflowDrawerComponent implements OnInit, OnDestroy {

  @ViewChild(MatDrawer, {static: true}) drawer: MatDrawer;

  constructor(private actionState: WorkflowActionState) {
  }

  ngOnInit(): void {
    this.actionState.init(this.drawer);
  }

  ngOnDestroy(): void {
    this.actionState.clear();
  }


}
