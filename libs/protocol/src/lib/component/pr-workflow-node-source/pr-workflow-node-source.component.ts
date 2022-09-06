import {Component, OnInit} from '@angular/core';
import {PrWorkflowNodeProcessDirective} from '../../directive/pr-workflow-node-process.directive';
import {PrWorkflowNodeIo} from '../../model/node/pr-workflow-node-io.class';
import {Observable} from 'rxjs';

@Component({
  selector: 'pr-workflow-node-source',
  templateUrl: './pr-workflow-node-source.component.html',
  styleUrls: ['./pr-workflow-node-source.component.scss']
})
export class PrWorkflowNodeSourceComponent extends PrWorkflowNodeProcessDirective implements OnInit {

  resourceId$: Observable<string>;

  node: PrWorkflowNodeIo;

  ngOnInit(): void {
    this.initNode();
    this.resourceId$ = this.node.getResourceId$();
  }


}
