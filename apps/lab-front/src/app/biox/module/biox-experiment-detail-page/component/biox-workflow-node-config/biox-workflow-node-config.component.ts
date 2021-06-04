import {Component, OnInit} from '@angular/core';
import {BioxWorkflowNodeDetailState} from '../../state/biox-workflow-node-detail.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Show the config current values as json
 */
@Component({
  selector: 'gen-biox-workflow-node-config',
  templateUrl: './biox-workflow-node-config.component.html',
  styleUrls: ['./biox-workflow-node-config.component.scss']
})
export class BioxWorkflowNodeConfigComponent implements OnInit {

  configValue$: Observable<any>;

  constructor(private nodeDetailState: BioxWorkflowNodeDetailState) {
  }

  ngOnInit(): void {
    this.configValue$ = this.nodeDetailState.getProcess$().pipe(
      map(process => process.config.data.mergeConfigWithDefault())
    );
  }

}
