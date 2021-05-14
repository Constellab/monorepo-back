import {Component, Input, OnInit} from '@angular/core';
import {WorkflowNode} from '../../model/workflow-node.class';

@Component({
  selector: 'gen-biox-workflow-node-detail',
  templateUrl: './biox-workflow-node-detail.component.html',
  styleUrls: ['./biox-workflow-node-detail.component.scss']
})
export class BioxWorkflowNodeDetailComponent implements OnInit {

  @Input() node: WorkflowNode<any>;

  constructor() {
  }

  ngOnInit(): void {
  }

}
