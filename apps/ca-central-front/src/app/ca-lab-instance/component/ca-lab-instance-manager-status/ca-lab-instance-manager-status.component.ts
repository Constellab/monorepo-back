import {Component, Input, OnInit} from '@angular/core';
import {CaLabManagerStatus} from '../../../ca-core/model/entities/ca-lab-manager.class';

/**
 * Simple component to display the lab status via the manager
 */
@Component({
  selector: 'ca-lab-instance-manager-status',
  templateUrl: './ca-lab-instance-manager-status.component.html',
  styleUrls: ['./ca-lab-manager-status.component.scss']
})
export class CaLabInstanceManagerStatusComponent implements OnInit {

  @Input() labStatus: CaLabManagerStatus;

  constructor() {
  }

  ngOnInit(): void {
  }

}
