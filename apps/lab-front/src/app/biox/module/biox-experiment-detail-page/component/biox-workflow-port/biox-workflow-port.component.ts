import {Component, Input, OnInit} from '@angular/core';
import {WorkflowPort} from '../../model/workflow-port.class';

/**
 * Component to show a single port of a node
 */
@Component({
  selector: 'gen-biox-workflow-port',
  templateUrl: './biox-workflow-port.component.html',
  styleUrls: ['./biox-workflow-port.component.scss']
})
export class BioxWorkflowPortComponent implements OnInit {

  @Input() port: WorkflowPort;

  constructor() { }

  ngOnInit(): void {
  }

}
