import {Component, Input, OnInit} from '@angular/core';
import {LabIOSpec} from '../../../../model/entities/lab-io.entity';

/**
 * Component to show a list of port with associated types
 */
@Component({
  selector: 'lab-process-ports-list',
  templateUrl: './lab-process-ports-list.component.html',
  styleUrls: ['./lab-process-ports-list.component.scss']
})
export class LabProcessPortsListComponent implements OnInit {

  @Input() ports: Record<string, LabIOSpec>

  constructor() {
  }

  ngOnInit(): void {
  }

}
