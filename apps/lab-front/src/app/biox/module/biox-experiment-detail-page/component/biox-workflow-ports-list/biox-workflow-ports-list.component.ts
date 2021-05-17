import {Component, Input, OnInit} from '@angular/core';
import {WorkflowPort} from '../../model/workflow-port.class';

/**
 * Component to show a list of input or output ports of a node
 */
@Component({
  selector: 'gen-biox-workflow-ports-list',
  templateUrl: './biox-workflow-ports-list.component.html',
  styleUrls: ['./biox-workflow-ports-list.component.scss']
})
export class BioxWorkflowPortsListComponent implements OnInit {

  @Input() ports: WorkflowPort[];

  constructor() { }

  ngOnInit(): void {
  }

}
