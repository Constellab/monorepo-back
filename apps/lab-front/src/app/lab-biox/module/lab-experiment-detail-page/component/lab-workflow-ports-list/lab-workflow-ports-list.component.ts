import {Component, Input, OnInit} from '@angular/core';
import {LabWorkflowPort} from '../../model/lab-workflow-port.class';

/**
 * Component to show a list of input or output ports of a node
 */
@Component({
  selector: 'lab-workflow-ports-list',
  templateUrl: './lab-workflow-ports-list.component.html',
  styleUrls: ['./lab-workflow-ports-list.component.scss']
})
export class LabWorkflowPortsListComponent implements OnInit {

  @Input() ports: LabWorkflowPort[];

  constructor() { }

  ngOnInit(): void {
  }

}
