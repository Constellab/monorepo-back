import {Component, OnInit} from '@angular/core';
import {LabWorkflowNodeDetailState} from '../../state/lab-workflow-node-detail.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Show the config current values as json
 */
@Component({
  selector: 'lab-workflow-node-config',
  templateUrl: './lab-workflow-node-config.component.html',
  styleUrls: ['./lab-workflow-node-config.component.scss']
})
export class LabWorkflowNodeConfigComponent implements OnInit {

  configValue$: Observable<any>;

  constructor(private nodeDetailState: LabWorkflowNodeDetailState) {
  }

  ngOnInit(): void {
    this.configValue$ = this.nodeDetailState.getProcess$().pipe(
      map(process => process.config.data.mergeConfigWithDefault())
    );
  }

}
